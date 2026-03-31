import { useCallback, useEffect, useRef, useState } from 'react';

type SourceOption = {
  label: string;
  value: string;
};

type UseEmbeddedSourceFallbackResult = {
  activeSource: string | null;
  failedSources: string[];
  isLoading: boolean;
  notice: string | null;
  setActiveSource: (value: string) => void;
  handleFrameError: () => void;
  handleFrameLoad: () => void;
};

const LOAD_TIMEOUT_MS = 10000;

export const useEmbeddedSourceFallback = (
  sources: SourceOption[],
  initialValue: string | null,
  resetKey: string,
): UseEmbeddedSourceFallbackResult => {
  const [activeSource, setActiveSourceState] = useState<string | null>(initialValue);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialValue));
  const [notice, setNotice] = useState<string | null>(null);
  const failedSourcesRef = useRef<string[]>([]);
  const frameLoadedRef = useRef(false);

  useEffect(() => {
    const defaultSource = initialValue ?? sources[0]?.value ?? null;

    failedSourcesRef.current = [];
    frameLoadedRef.current = false;
    setActiveSourceState(defaultSource);
    setFailedSources([]);
    setIsLoading(Boolean(defaultSource));
    setNotice(null);
  }, [initialValue, resetKey, sources]);

  const markSourceAsFailed = useCallback(
    (failedValue: string) => {
      const currentSource = sources.find((source) => source.value === failedValue);
      const nextFailedSources = failedSourcesRef.current.includes(failedValue)
        ? failedSourcesRef.current
        : [...failedSourcesRef.current, failedValue];
      const fallbackSource = sources.find(
        (source) => source.value !== failedValue && !nextFailedSources.includes(source.value),
      );

      failedSourcesRef.current = nextFailedSources;
      setFailedSources(nextFailedSources);

      if (fallbackSource) {
        frameLoadedRef.current = false;
        setActiveSourceState(fallbackSource.value);
        setIsLoading(true);
        setNotice(
          `${currentSource?.label ?? 'Cette source'} ne repond pas. Passage automatique a ${
            fallbackSource.label
          }.`,
        );
        return;
      }

      setIsLoading(false);
      setNotice('Aucune autre source disponible pour prendre le relais.');
    },
    [sources],
  );

  useEffect(() => {
    if (!activeSource) {
      setIsLoading(false);
      return;
    }

    frameLoadedRef.current = false;
    setIsLoading(true);

    const timeoutId = window.setTimeout(() => {
      if (!frameLoadedRef.current) {
        markSourceAsFailed(activeSource);
      }
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeSource, markSourceAsFailed]);

  const setActiveSource = (value: string) => {
    frameLoadedRef.current = false;
    setNotice(null);
    setIsLoading(true);
    setFailedSources((currentSources) => {
      const nextSources = currentSources.filter((entry) => entry !== value);
      failedSourcesRef.current = nextSources;
      return nextSources;
    });
    setActiveSourceState(value);
  };

  const handleFrameLoad = () => {
    frameLoadedRef.current = true;
    setIsLoading(false);
  };

  const handleFrameError = () => {
    if (activeSource) {
      markSourceAsFailed(activeSource);
    }
  };

  return {
    activeSource,
    failedSources,
    isLoading,
    notice,
    setActiveSource,
    handleFrameError,
    handleFrameLoad,
  };
};
