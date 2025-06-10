import '../styles/SearchContainer.css';

import {
  FormEvent,
  useContext,
  useEffect,
  useState,
  createRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { APIContext } from '../AppContainer';
import { PostContext } from './Posts';
import SelectedTags from './SelectedTags';

export default function SearchContainer() {
  const handler = useContext(APIContext);
  const {
    tags,
    handleTag,
    setPosts,
    excludedTags,
    setSuggestions,
    suggestions,
    setCurrentSearchValue,
    currentSearchValue,
    setInclude,
    include,
  } = useContext(PostContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [postCount, setPostCount] = useState<number>(0);

  const searchRef = createRef<HTMLInputElement>();

  const handleInputChange = (evt: FormEvent<HTMLInputElement>) => {
    setSuggestions([]);
    setLoading(true);
    setCurrentSearchValue((evt.target as HTMLInputElement).value);
  };

  const fetchAutocomplete = useCallback(() => {
    handler
      .getAutocomplete(currentSearchValue.replaceAll(' ', '_'))
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [currentSearchValue, setSuggestions, handler]);

  const handleKeyUp = async (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      const tag = await handler.getTag((evt.target as HTMLInputElement).value.replaceAll(" ", "_"));
      if (!tag) {
        return;
      }

      handleTag(tag);
      setCurrentSearchValue('');
      (searchRef?.current ?? { value: '' }).value = '';
    }
  };

  const handlePotentialBlur = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    if (
      !(evt.target instanceof HTMLElement) ||
      evt.target.id === 'autocomplete' ||
      evt.target.classList.contains('auto_tag') ||
      evt.target.id === 'search_input' ||
      evt.target.id === 'include'
    ) {
      return;
    } else {
      setFocused(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handlePotentialBlur);

    return () => {
      window.removeEventListener('click', handlePotentialBlur);
    };
  });

  useEffect(() => {
    if (!currentSearchValue) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchAutocomplete();
    }, 333);

    return () => {
      if (handler.canAbort()) {
        handler.abort();
      }
      clearTimeout(timeout);
    };
  }, [currentSearchValue, handler, fetchAutocomplete, setSuggestions]);

  return (
    <div id="search_container">
      <div id="input_area">
        <input
          id="include"
          type="button"
          value={include ? '+' : '-'}
          onClick={() => {
            setInclude(prev => !prev);
          }}
        />
        <input
          ref={searchRef}
          type="text"
          autoComplete="off"
          id="search_input"
          placeholder="Search for a tag..."
          onInput={handleInputChange}
          onKeyUp={handleKeyUp}
          onFocus={() => setFocused(true)}
        />
        <input
          id="search"
          type="button"
          value="Search"
          onClick={() => {
            handler.getPosts(tags, excludedTags).then(setPosts);
            handler.getPostCount(tags, excludedTags).then(setPostCount);
          }}
        />
      </div>
      <div id="postcount">{postCount}</div>
      <div id="autocomplete" style={{ display: focused && currentSearchValue ? 'block' : 'none' }}>
        {loading ? <div id="loading_spinner" /> : null}
        {suggestions.map(tag => (
          <div
            className="auto_tag"
            onClick={() => {
              handleTag(tag);
              setCurrentSearchValue('');
              (searchRef?.current ?? { value: '' }).value = '';
            }}
            key={tag.id}
          >
            {tag.name} ({tag.count})
          </div>
        ))}
      </div>
      <SelectedTags visible={true} type="inc" />
      <SelectedTags visible={true} type="exc" />
    </div>
  );
}
