import '../styles/R34Image.css';
import Post from '../../model/Post';
import { PostContext } from './Posts';
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Image(props: {
  onClick: () => void;
  post: Post;
  tags: ReactNode;
  fs: boolean;
  idx: number;
}) {
  const { post, onClick, fs, idx, tags } = props;
  const { posts, getMorePosts } = useContext(PostContext);

  const [domainIndex, setDomainIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const fallbackDomains = ['us', 'api-cdn', ''];
  const urlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [ref, inView] = useInView({ threshold: 0.6 });

  const getFileUrl = (domain: string): string => {
    return post.file_url.replace(/^(https?:\/\/)([^.]+\.)?/, domain ? `$1${domain}.` : '$1');
  };

  const fileUrl = getFileUrl(fallbackDomains[domainIndex]);

  useEffect(() => {
    if (inView && idx >= posts.length - 4) {
      getMorePosts();
    }
  }, [inView, posts, getMorePosts, idx]);

  useEffect(() => {
    if (inView && !hasLoaded) {
      urlTimeoutRef.current = setTimeout(() => {
        if (domainIndex < fallbackDomains.length - 1) {
          setDomainIndex(prev => prev + 1);
        }
      }, 1500);
    }

    return () => {
      if (urlTimeoutRef.current) {
        clearTimeout(urlTimeoutRef.current);
      }
    };
  }, [inView, hasLoaded, domainIndex]);

  const handleLoad = () => {
    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }
    if (!hasLoaded) {
      setHasLoaded(true);
    }
  };

  const handleError = () => {
    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }
    if (!hasLoaded && domainIndex < fallbackDomains.length - 1) {
      setDomainIndex(prev => prev + 1);
    }
  };

  if (fs) {
    return (
      <img
        style={{
          width: post.width * 3 < post.height ? '33vw' : '',
          height: post.width * 3 < post.height ? 'auto' : '',
        }}
        about=""
        key={post.id}
        loading="eager"
        alt={post.tags}
        src={fileUrl}
        id={`id_${String(post.id)}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  return (
    <div className="r34image r34media" id={`post_${post.id}`}>
      <img
        about=""
        ref={ref}
        key={post.id}
        loading="eager"
        alt={post.tags}
        onClick={onClick}
        id={`id_${String(post.id)}`}
        src={fileUrl}
        onLoad={handleLoad}
        onError={handleError}
      />
      {tags}
    </div>
  );
}
