import { createRef, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import Post from '../../model/Post';

import '../styles/R34Video.css';
import { PostContext } from './Posts';

export default function Video(props: {
  post: Post;
  onClick: () => void;
  fs: boolean;
  idx: number;
  tags?: ReactNode;
}) {
  // Destructuring
  const { onClick, post, fs, idx } = props;
  const { isFs, posts, getMorePosts, volume, setVolume } = useContext(PostContext);
  const [fileUrl, setFileUrl] = useState<string>(post.file_url);
  const videoRef = createRef<HTMLVideoElement>();

  const [played, setPlayed] = useState<boolean>(false);

  const [ref, inView] = useInView({
    threshold: 0.6,
  });

  const [refPause, inViewPause, entryPause] = useInView({
    threshold: 0,
  });

  const setRefs = useCallback(
    (node: HTMLVideoElement | null | undefined) => {
      ref(node);
      refPause(node);
    },
    [ref, refPause],
  );

  const urlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!inViewPause && entryPause?.target instanceof HTMLVideoElement) {
      entryPause.target.pause();
    }
  }, [inViewPause, entryPause]);

  useEffect(() => {
    urlTimeoutRef.current = setTimeout(() => {
      setFileUrl(prev => prev.replace('us.', 'api-cdn-mp4.'));
    }, 1500);
  }, [urlTimeoutRef]);

  useEffect(() => {
    if (inView && idx >= posts.length - 4) {
      getMorePosts();
    }
  }, [inView, posts, getMorePosts, idx]);

  useEffect(() => {
    if (!isFs) {
      const media = document.querySelector('#fs_div > video');
      if (media && media instanceof HTMLVideoElement) {
        media.pause();
      }
    }
  }, [isFs]);

  if (fs) {
    return (
      <video
        autoPlay
        controls={true}
        loop={true}
        src={fileUrl.replace('api-cdn-mp4', 'us')}
        onLoadedData={evt => {
          clearTimeout(urlTimeoutRef.current ?? undefined);
          evt.currentTarget.focus();
          evt.currentTarget.volume = volume;
        }}
        onWheel={e => {
          setVolume(prev => {
            prev = Math.min(1, Math.max(0, prev - e.deltaY / 2000));
            if (videoRef.current) {
              videoRef.current.volume = prev;
            }
            return prev;
          });
        }}
        ref={videoRef}
        onPlay={evt => {
          clearTimeout(urlTimeoutRef.current ?? undefined);
          evt.currentTarget.focus();
          if (!played) {
            const reg = document.querySelector(`#post_${post.id}`);
            evt.currentTarget.volume = volume;

            let video;
            if (reg && (video = reg.querySelector('video'))) {
              evt.currentTarget.currentTime = video.currentTime;
            }
            setPlayed(true);
          }
        }}
      />
    );
  }

  return (
    <div className="r34video r34media" id={`post_${post.id}`}>
      <video
        poster={post.sample_url}
        controls={true}
        src={fileUrl.replace('api-cdn-mp4', 'us')}
        onLoadedData={() => {
          clearTimeout(urlTimeoutRef.current ?? undefined);
        }}
        onClick={onClick}
        onPlay={evt => {
          clearTimeout(urlTimeoutRef.current ?? undefined);
          if (!played) {
            evt.currentTarget.volume = 0.1;
            setPlayed(true);
          }
        }}
        ref={setRefs}
      />
      {!fs ? props.tags : null}
    </div>
  );
}
