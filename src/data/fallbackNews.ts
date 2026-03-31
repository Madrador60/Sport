import { NewsArticle } from '../types';

export const fallbackNews: NewsArticle[] = [
  {
    id: 'fallback-news-1',
    title: 'Football : le sprint final s intensifie avant les grands rendez-vous',
    summary:
      'Les dernieres affiches nationales et europeennes relancent la course aux places fortes pour la fin de saison.',
    category: 'Football',
    link: 'https://www.lequipe.fr/',
    image: 'https://medias.lequipe.fr/img-photo-png/-/1500000000833469/0-828-552-75/0cb67.png',
    source: "L'Equipe",
    publishedTimestamp: Date.parse('2026-03-31T18:10:00+02:00'),
    author: 'Redaction',
  },
  {
    id: 'fallback-news-2',
    title: 'Tennis : les tournois de printemps montent en intensite',
    summary:
      'Les favoris se rapprochent des derniers tours et les outsiders confirment leur forme du moment.',
    category: 'Tennis',
    link: 'https://www.lequipe.fr/',
    image: 'https://medias.lequipe.fr/img-photo-png/-/1500000000833469/0-828-552-75/0cb67.png',
    source: "L'Equipe",
    publishedTimestamp: Date.parse('2026-03-31T16:40:00+02:00'),
    author: 'Redaction',
  },
  {
    id: 'fallback-news-3',
    title: 'JO 2030 : les discussions s accelerent autour des sites attendus',
    summary:
      'Les prochaines semaines doivent permettre d affiner la repartition des sites et les grands equilibres du projet.',
    category: 'JO 2030',
    link: 'https://www.lequipe.fr/',
    image: 'https://medias.lequipe.fr/img-photo-png/-/1500000000833469/0-828-552-75/0cb67.png',
    source: "L'Equipe",
    publishedTimestamp: Date.parse('2026-03-31T14:20:00+02:00'),
    author: 'Redaction',
  },
  {
    id: 'fallback-news-4',
    title: 'Tous sports : les infos a ne pas rater du jour',
    summary:
      'Une selection de nouvelles sportives en francais pour garder un oeil sur l essentiel meme si le flux live est indisponible.',
    category: 'Tous sports',
    link: 'https://www.lequipe.fr/',
    image: 'https://medias.lequipe.fr/img-photo-png/-/1500000000833469/0-828-552-75/0cb67.png',
    source: "L'Equipe",
    publishedTimestamp: Date.parse('2026-03-31T12:00:00+02:00'),
  },
];
