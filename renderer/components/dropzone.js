import PropTypes from 'prop-types';
import classNames from 'classnames';

const droppedFile = (e, hide, onDrop) => {
  hide();

  if (!e.dataTransfer || !e.dataTransfer.files) {
    return;
  }

  e.stopPropagation();
  e.preventDefault();

  if (e.dataTransfer.files.length === 1) {
    onDrop(e.dataTransfer.files[0].path);
  } else {
    const paths = [];

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const { path } = e.dataTransfer.files.item(i);
      paths.push(path);
    }

    onDrop(paths);
  }
};

const preventDefault = event => {
  // Make the cursor look good
  event.dataTransfer.effectAllowed = 'copyMove';
  event.dataTransfer.dropEffect = 'copy';

  event.preventDefault();
};

const DropZone = ({ darkMode, hide, onDrop }) => {
  const classes = classNames({ darkMode });

  return (
    <aside
      onDragLeave={hide}
      onDragOver={preventDefault}
      onDrop={e => droppedFile(e, hide, onDrop)}
    >
      <section className={classes}>
        <span>
          <h1>Drop to Deploy</h1>
          <p>
            Your files will be deployed to <b>Now</b>
          </p>
        </span>
      </section>

      <style jsx>{`
        aside {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: transparent;
          z-index: 20000;
          overflow: hidden;
        }

        section {
          display: block;
          height: 304px;
          background: #fff;
          padding: 20px;
          box-sizing: border-box;
          width: 100%;
          margin-top: 36px;
          pointer-events: none;
        }

        section.darkMode {
          background: #121212;
          color: #fff;
        }

        span {
          display: block;
          border: 1px dashed #d0d0d0;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 5px;
        }

        section.darkMode span {
          border-color: #444;
        }

        h1 {
          font-size: 16px;
          margin-bottom: 7px;
        }

        p {
          text-align: center;
          font-size: 12px;
          width: 250px;
          line-height: 20px;
          margin-top: -2px;
        }

        b {
          font-weight: 700;
        }
      `}</style>
    </aside>
  );
};

DropZone.propTypes = {
  darkMode: PropTypes.bool,
  hide: PropTypes.func,
  onDrop: PropTypes.func
};

export default DropZone;
