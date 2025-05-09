import '../styles/R34Image.css';

import Post from '../../model/Post';
import { PostContext } from './Posts';

import { ReactNode, useContext, useEffect } from 'react';
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

  useEffect(() => {
    if (inView && idx >= posts.length - 4) {
      getMorePosts();
    }
  }, [inView, posts, getMorePosts, idx]);

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
        src={post.file_url}
        id={`id_${String(post.id)}`}
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
        src={post.file_url}
      />
      {props.tags}
    </div>
  );
}
