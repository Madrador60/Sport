import { NewsArticle } from '../types';
import { toErrorMessage } from '../utils/common';

const NEWS_FEED_URL = 'https://dwh.lequipe.fr/api/edito/rss?path=/Tous-sports/';
const NEWS_REQUEST_HEADERS = {
  Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, text/plain;q=0.8, */*;q=0.7',
};
const MAX_NEWS_ITEMS = 18;
const NOISY_LINK_SEGMENTS = ['/Guide-d-achat/', '/jeux', '/Respire/', '/Sport-et-style/'];
const NOISY_CATEGORIES = ['guide d achat', 'quiz', 'special l equipe'];

export const NEWS_SOURCE_LABEL = "L'Equipe";
export const NEWS_FALLBACK_NOTICE =
  "Affichage des actualites locales de secours car le flux francais n'a pas pu etre charge pour le moment.";

export const fetchFrenchSportsNews = async (signal: AbortSignal): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(NEWS_FEED_URL, {
      signal,
      headers: NEWS_REQUEST_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const articles = parseNewsFeed(await response.text());

    if (articles.length === 0) {
      throw new Error('Aucune actualite recue');
    }

    return articles.slice(0, MAX_NEWS_ITEMS);
  } catch (error) {
    throw new Error(`Flux actualites indisponible: ${toErrorMessage(error)}`);
  }
};

const parseNewsFeed = (xmlText: string): NewsArticle[] => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  if (xml.querySelector('parsererror')) {
    throw new Error('Flux XML invalide');
  }

  const uniqueArticles = new Map<string, NewsArticle>();
  const items = Array.from(xml.querySelectorAll('item'));

  items.forEach((item, index) => {
    const article = parseNewsItem(item, index);

    if (!article || shouldSkipArticle(article)) {
      return;
    }

    const key = normalizeArticleKey(article);

    if (!uniqueArticles.has(key)) {
      uniqueArticles.set(key, article);
    }
  });

  return Array.from(uniqueArticles.values()).sort(
    (left, right) => right.publishedTimestamp - left.publishedTimestamp,
  );
};

const parseNewsItem = (item: Element, index: number): NewsArticle | null => {
  const title = readText(item, 'title');
  const link = stripFeedTracking(readText(item, 'link'));
  const guid = stripFeedTracking(readText(item, 'guid'));
  const pubDate = readText(item, 'pubDate');
  const category = readText(item, 'category') || 'Tous sports';
  const author = readText(item, 'dc\\:creator, creator');
  const descriptionHtml = readText(item, 'description');
  const descriptionDocument = new DOMParser().parseFromString(descriptionHtml, 'text/html');
  const summary = collapseWhitespace(descriptionDocument.body.textContent ?? '');
  const image =
    item.querySelector('enclosure')?.getAttribute('url')?.trim() ||
    descriptionDocument.querySelector('img')?.getAttribute('src')?.trim() ||
    '';
  const publishedTimestamp = Date.parse(pubDate);

  if (!title || !(link || guid)) {
    return null;
  }

  return {
    id: guid || link || `news-${index}`,
    title,
    summary: summary || 'Ouvre la source pour lire l article complet.',
    category,
    link: link || guid,
    image,
    source: NEWS_SOURCE_LABEL,
    publishedTimestamp: Number.isFinite(publishedTimestamp)
      ? publishedTimestamp
      : Date.now() - index * 60_000,
    author: author || undefined,
  };
};

const readText = (node: ParentNode, selector: string): string =>
  collapseWhitespace(node.querySelector(selector)?.textContent ?? '');

const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const stripFeedTracking = (value: string): string => value.replace(/#at_medium=RSS_feeds$/i, '');

const normalizeArticleKey = (article: NewsArticle): string =>
  (article.link || article.id || article.title).toLowerCase();

const shouldSkipArticle = (article: NewsArticle): boolean => {
  const normalizedCategory = article.category.toLowerCase();

  if (NOISY_CATEGORIES.some((entry) => normalizedCategory.includes(entry))) {
    return true;
  }

  return NOISY_LINK_SEGMENTS.some((segment) => article.link.includes(segment));
};
