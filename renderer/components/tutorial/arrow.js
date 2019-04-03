// Vectors
import ArrowSVG from '../../vectors/arrow';

const SliderArrow = props => {
  const properties = Object.assign({}, props);

  const uselessProps = ['currentSlide', 'slideCount'];

  for (const prop of uselessProps) {
    delete properties[prop];
  }

  return (
    <div {...properties}>
      <ArrowSVG />
    </div>
  );
};

export default SliderArrow;
