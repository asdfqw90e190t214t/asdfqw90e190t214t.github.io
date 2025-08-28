import { createRef, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
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
  const { onClick, post, fs, idx, tags } = props;
  const { isFs, posts, getMorePosts, volume, setVolume } = useContext(PostContext);

  const [played, setPlayed] = useState(false);
  const fileUrl = post.file_url;
  const videoRef = createRef<HTMLVideoElement>();

  const [ref, inView] = useInView({ threshold: 0.6 });
  const [refPause, inViewPause, entryPause] = useInView({ threshold: 0 });

  const setRefs = useCallback(
    (node: HTMLVideoElement | null | undefined) => {
      ref(node);
      refPause(node);
    },
    [ref, refPause],
  );

  useEffect(() => {
    if (!inViewPause && entryPause?.target instanceof HTMLVideoElement) {
      entryPause.target.pause();
    }
  }, [inViewPause, entryPause]);

  useEffect(() => {
    if (inView && idx >= posts.length - 4) {
      getMorePosts();
    }
  }, [inView, posts, getMorePosts, idx]);

  useEffect(() => {
    if (!isFs) {
      const media = document.querySelector('#fs_div > video');
      if (media instanceof HTMLVideoElement) {
        media.pause();
      }
    }
  }, [isFs]);

  const handleVolumeWheel = (e: React.WheelEvent<HTMLVideoElement>) => {
    setVolume(prev => {
      const newVol = Math.min(1, Math.max(0, prev - e.deltaY / 2000));
      if (videoRef.current) {
        videoRef.current.volume = newVol;
      }
      return newVol;
    });
  };

  const handleVideoPlay = (evt: React.SyntheticEvent<HTMLVideoElement>) => {
    evt.currentTarget.focus();

    if (!played) {
      const reg = document.querySelector(`#post_${post.id}`);
      const otherVideo = reg?.querySelector('video') as HTMLVideoElement | null;

      if (otherVideo) {
        evt.currentTarget.currentTime = otherVideo.currentTime;
      }

      evt.currentTarget.volume = volume;
      setPlayed(true);
    }
  };

  if (fs) {
    return (
      <video
        autoPlay
        controls
        loop
        src={fileUrl}
        onWheel={handleVolumeWheel}
        ref={videoRef}
        onPlay={handleVideoPlay}
      />
    );
  }

  return (
    <div className="r34video r34media" id={`post_${post.id}`}>
      <video poster={post.sample_url} controls src={fileUrl} onClick={onClick} ref={setRefs} />
      {!fs && tags}
    </div>
  );
}
