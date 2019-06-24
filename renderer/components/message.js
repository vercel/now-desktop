import PropTypes from 'prop-types';

const Message = ({ text, entities }) => {
  let parts = [];

  let lastPartIndex = 0;
  entities.forEach(entity => {
    if (entity.start === -1) {
      return parts.push(text.substring(lastPartIndex, text.length));
    }

    parts.push(text.substring(lastPartIndex, entity.start));
    lastPartIndex = entity.end;
  });

  parts.push(text.substring(lastPartIndex, text.length));

  parts = parts.filter(p => p.length > 0);

  let lastEntityIndex = 0;
  entities.forEach(entity => {
    if (entity.start === -1) {
      return;
    }

    // Create entity component
    const component = (
      <b key={JSON.stringify(entity)}>
        {text.substring(entity.start, entity.end)}
      </b>
    );

    // If first entity isn't an author, offset the whole construct by one
    if (lastEntityIndex === 0 && entity.start !== 0) {
      parts.splice(1, 0, component);

      lastEntityIndex += 3;
    } else {
      parts.splice(lastEntityIndex, 0, component);
      lastEntityIndex += 2;
    }
  });

  return <p>{parts}</p>;
};

Message.propTypes = {
  text: PropTypes.string,
  entities: PropTypes.array
};

export default Message;
