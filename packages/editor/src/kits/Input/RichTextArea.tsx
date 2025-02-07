import './style.scss';

interface Props {
	value?: string;
}

export default ({ value }: Props) => {
	return <div className="rich-textarea" contentEditable />;
};
