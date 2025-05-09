import '../styles/TagSuggestion.css';
import Tag from '../../model/Tag';

export default function TagSuggestion(props: {
  tag: Tag;
  updateTags: (t: Tag, b?: boolean) => void;
}) {
  const { tag, updateTags } = props;

  return (
    <div
      className="tag_suggestion"
      data-type={tag.type}
      style={{ color: tag.getColor() }}
      onClick={() => {
        updateTags(tag);
        (document.querySelector('#search') as HTMLInputElement).value = '';
      }}
    >
      {(tag.name ?? '').replaceAll('_', ' ')}
      {` (${tag.count})`}
    </div>
  );
}
