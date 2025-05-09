import '../styles/SelectedTags.css';

import { useContext } from 'react';
import { PostContext } from './Posts';

export default function SelectedTags(props: { visible: boolean; type: 'inc' | 'exc' }) {
  const { tags, handleTag, excludedTags } = useContext(PostContext);
  const { visible, type } = props;

  if (type === 'inc') {
    return (
      <div id="selected_tags" style={{ display: visible ? 'block' : 'none' }}>
        {tags.map(tag => (
          <div
            className="selected_tag"
            onClick={() => {
              handleTag(tag);
            }}
            key={`${tag.id}_selected`}
          >
            {tag.name}
            {` (${tag.count})`}
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div id="excluded_tags" style={{ display: visible ? 'block' : 'none' }}>
        {excludedTags.map(tag => (
          <div
            className="excluded_tag"
            onClick={() => {
              handleTag(tag);
            }}
            key={`${tag.id}_excluded`}
          >
            {tag.name}
            {` (${tag.count})`}
          </div>
        ))}
      </div>
    );
  }
}
