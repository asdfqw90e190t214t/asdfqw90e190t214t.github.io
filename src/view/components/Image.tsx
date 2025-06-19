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
  const { post, onClick, fs, idx } = props;
  const { posts, getMorePosts } = useContext(PostContext);
  const { inView, ref } = useInView({
    threshold: 0.6,
  });

  const [fileUrl, setFileUrl] = useState<string>(post.file_url.replace('api-cdn', 'us'));

  const urlTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (inView && idx >= posts.length - 4) {
      getMorePosts();
    }
  }, [inView, posts, getMorePosts, idx]);

  useEffect(() => {
    urlTimeoutRef.current = setTimeout(() => {
      setFileUrl(prev => prev.replace('us.', 'api-cdn.'));
    }, 1500);

    return () => clearTimeout(urlTimeoutRef.current);
  }, [urlTimeoutRef]);

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
        onLoadedData={() => clearTimeout(urlTimeoutRef.current)}
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
        onLoad={() => clearTimeout(urlTimeoutRef.current)}
      />
      {props.tags}
    </div>
  );
}
