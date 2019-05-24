import PropTypes from 'prop-types';
import classNames from 'classnames';

const isFolder = fileOrFolder => {
  return typeof fileOrFolder.getFilesAndDirectories === 'function';
};

const droppedFile = (e, hide, onDrop) => {
  hide();

  if (!e.dataTransfer || !e.dataTransfer.files) {
    return;
  }

  e.stopPropagation();
  e.preventDefault();

  const files = [];

  const handleFile = (file, path) => {
    file.fullPath = `${path}/${file.name}`;

    // Trim all leading slashes
    while (file.fullPath.startsWith('/')) {
      file.fullPath = file.fullPath.slice(1);
    }

    files.push(file);
  };

  let initialPath;

  const iterateFilesAndDirs = async (filesAndDirs, path, initial) => {
    for (const fileOrFolder of filesAndDirs) {
      if (isFolder(fileOrFolder)) {
        let currentFolder;

        // We want to trim the top level since we need the contents of it
        if (initial) {
          currentFolder = '/';
          initialPath = fileOrFolder.path;
        } else {
          currentFolder = fileOrFolder.path.replace(initialPath, '/');
        }

        // Traverse subfolders
        const contents = await fileOrFolder.getFilesAndDirectories();

        await iterateFilesAndDirs(contents, currentFolder);
      } else {
        handleFile(fileOrFolder, path);
      }
    }
  };

  // Begin by traversing the chosen files and directories
  if ('getFilesAndDirectories' in e.dataTransfer) {
    e.dataTransfer.getFilesAndDirectories().then(async filesAndDirs => {
      await iterateFilesAndDirs(filesAndDirs, '/', true);

      // Handle dropped files
      if (onDrop) {
        onDrop(files);
      }
    });
  } else if (onDrop) {
    // We shouldn't be here, but if we are, something went horribly wrong and we need to default to files
    onDrop(e.dataTransfer.files);
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
