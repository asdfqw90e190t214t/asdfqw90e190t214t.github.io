import '../styles/Posts.css';

import Post from '../../model/Post';
import Tag from '../../model/Tag';

import {
  Dispatch,
  RefObject,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { APIContext } from '../AppContainer';

import SearchContainer from './SearchContainer';
import FullscreenMedia from './FullscreenMedia';
import _ from 'lodash';

export const PostContext = createContext<{
  excludedTags: Tag[];
  tags: Tag[];
  handleTag: (tag: Tag | undefined) => void;
  setSuggestions: Dispatch<SetStateAction<Tag[]>>;
  suggestions: Tag[];
  posts: Post[];
  fsRef?: RefObject<HTMLDivElement>;
  isFs: boolean;
  setIsFs: Dispatch<SetStateAction<boolean>>;
  curPost: number;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  getMorePosts: (b?: boolean) => Promise<void>;
  setCurrentSearchValue: Dispatch<SetStateAction<string>>;
  setInclude: Dispatch<SetStateAction<boolean>>;
  currentSearchValue: string;
  include: boolean;
  page: number;
  volume: number;
  setVolume: Dispatch<SetStateAction<number>>;
}>({
  excludedTags: [],
  tags: [],
  handleTag: () => {},
  setSuggestions: () => {},
  suggestions: [],
  posts: [],
  isFs: false,
  setIsFs: () => {},
  curPost: 0,
  fsRef: undefined,
  setPosts: () => {},
  getMorePosts: () => new Promise<void>(() => {}),
  setCurrentSearchValue: () => {},
  setInclude: () => {},
  currentSearchValue: '',
  include: true,
  page: 0,
  volume: 0,
  setVolume: () => {},
});

export default function Posts() {
  const handler = useContext(APIContext);

  const [page, setPage] = useState<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [excludedTags, setExcludedTags] = useState<Tag[]>([]);
  const [isFs, setIsFs] = useState<boolean>(false);
  const [curPost, setCurPost] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [volume, setVolume] = useState<number>(0.1);

  const [include, setInclude] = useState<boolean>(true);
  const [currentSearchValue, setCurrentSearchValue] = useState<string>('');

  //Refs
  const fsRef = useRef<HTMLDivElement>(document.querySelector('#fs_div') as HTMLDivElement);

  const handleFullscreenChange = useCallback(() => {
    const target = document.querySelector(`#post_${posts[curPost]?.id ?? 0}`);
    if (
      target instanceof HTMLVideoElement &&
      document.fullscreenElement instanceof HTMLVideoElement
    ) {
      target.currentTime = document.fullscreenElement.currentTime;
    }

    if (!document.fullscreenElement) {
      setTimeout(() => {
        const elmt = document.querySelector(`#post_${posts[curPost]?.id ?? 0}`);
        elmt?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }

    setIsFs(() => {
      return document.fullscreenElement ? true : false;
    });
  }, [curPost, posts]);

  const getMorePosts = useCallback(async () => {
    const morePosts = await handler.getPosts(tags, excludedTags, page + 1);
    if (morePosts && morePosts.length > 0) {
      setPosts(prev => _.uniqBy([...prev, ...morePosts], 'id'));
      setPage(prev => prev + 1);
    }
  }, [page, handler, tags, excludedTags]);

  const handleTag = useCallback(
    (tag: Tag | undefined) => {
      if (!tag) {
        return;
      }

      if (
        tags.find(t => Number(t.id) === Number(tag.id)) ||
        excludedTags.find(t => Number(t.id) === Number(tag.id))
      ) {
        setTags(prev => {
          return prev.filter(t => Number(t.id) !== Number(tag.id));
        });

        setExcludedTags(prev => {
          return prev.filter(t => Number(t.id) !== Number(tag.id));
        });
      } else {
        if (include) {
          setTags(prev => [...prev, tag]);
        } else {
          setExcludedTags(prev => [...prev, tag]);
        }
      }
    },
    [include, tags, excludedTags],
  );

  const handleKey = useCallback(
    async (evt: KeyboardEvent) => {
      evt.stopPropagation();
      evt.preventDefault();

      if (isFs) {
        switch (evt.key) {
          case 'ArrowUp': {
            if (page === 0 && curPost === 0) {
              return;
            }

            if (curPost - 1 < 0) {
              break;
            } else {
              setCurPost(prev => Math.max(0, Math.min(prev - 1, posts.length - 1)));
            }
            break;
          }
          case 'ArrowDown': {
            if (curPost >= posts.length - 4) {
              await getMorePosts();
            }
            setCurPost(prev => Math.max(0, Math.min(prev + 1, posts.length - 1)));
            break;
          }
          case 'ArrowRight':
          case 'ArrowLeft': {
            if (!(document.fullscreenElement?.firstChild instanceof HTMLVideoElement)) {
              break;
            }

            if (document.fullscreenElement?.firstChild === document.activeElement) {
              break;
            }

            evt.preventDefault();

            const fsMedia = document.querySelector('#fs_div')?.firstChild;
            if (fsMedia && fsMedia instanceof HTMLVideoElement) {
              fsMedia.currentTime += evt.key === 'ArrowLeft' ? -2 : 2;
            }
            break;
          }
          default:
            break;
        }
      }
    },
    [posts, isFs, curPost, getMorePosts, page],
  );

  useEffect(() => {
    const target = fsRef.current?.firstElementChild;
    if (!target || !(target instanceof HTMLVideoElement)) {
      return;
    }

    target.addEventListener('fullscreenchange', () => {
      document.dispatchEvent(new Event('FullscreenChange'));
    });
  }, [fsRef]);

  useEffect(() => {
    const fse = document.querySelector('#fs_div') as HTMLDivElement;
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keyup', handleKey);
    //document.addEventListener("scrollend", handleScroll);
    fse.addEventListener('keyup', handleKey);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keyup', handleKey);
      fse.removeEventListener('keyup', handleKey);
    };
  }, [handleKey, handleFullscreenChange]);

  const ctx = {
    tags,
    handleTag,
    setSuggestions,
    suggestions,
    setPosts,
    isFs,
    curPost,
    posts,
    fsRef,
    excludedTags,
    setCurrentSearchValue,
    setInclude,
    currentSearchValue,
    include,
    page,
    getMorePosts,
    setIsFs,
    volume,
    setVolume,
  };

  return (
    <PostContext.Provider value={ctx}>
      <FullscreenMedia />
      <SearchContainer />
      <div id="posts">
        {posts.map((post, idx) =>
          post.asElement(handler, tags, excludedTags, handleTag, false, idx, () => {
            setCurPost(idx);
            setIsFs(true);
            document.querySelectorAll('video').forEach(v => v.pause());
            fsRef.current?.requestFullscreen();
          }),
        )}
      </div>
      <div
        className="include_button"
        onClick={evt => {
          evt.stopPropagation();
          evt.preventDefault();
          setInclude(prev => !prev);
        }}
      >
        {include ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="2vw" height="2vw">
            <path d="M12 2c.553 0 1 .447 1 1v8h8c.553 0 1 .447 1 1s-.447 1-1 1h-8v8c0 .553-.447 1-1 1s-1-.447-1-1v-8h-8c-.553 0-1-.447-1-1s.447-1 1-1h8v-8c0-.553.447-1 1-1z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="2vw" height="2vw">
            <path d="M19 13H5c-.553 0-1-.447-1-1s.447-1 1-1h14c.553 0 1 .447 1 1s-.447 1-1 1z" />
          </svg>
        )}
      </div>
    </PostContext.Provider>
  );
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
