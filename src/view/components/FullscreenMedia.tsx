import '../styles/FullscreenMedia.css';

import { useContext } from 'react';
import { PostContext } from './Posts';
import { APIContext } from '../AppContainer';

export default function FullscreenMedia() {
  const { posts, fsRef, isFs, curPost, tags, handleTag, excludedTags } = useContext(PostContext);
  const handler = useContext(APIContext);

  return (
    <div
      id="fs_div"
      style={{
        display: isFs ? 'flex' : 'none',
        justifyContent: 'center',
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        objectFit: 'cover',
        maxHeight: '100vh',
        overflow: 'scroll',
      }}
      ref={fsRef}
    >
      {isFs
        ? posts[curPost]?.asElement(
            handler,
            tags,
            excludedTags,
            handleTag,
            true,
            posts[curPost]?.id ?? -1,
          )
        : null}
    </div>
  );
}
