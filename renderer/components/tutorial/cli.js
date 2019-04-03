import { bool, func } from 'prop-types';
import binaryStyles from '../../styles/components/tutorial/cli';

const Binary = props => (
  <div className="cli-wrapper">
    <p className="has-tiny-spacing">
      <input
        id="cli"
        type="checkbox"
        checked={props.checked}
        className="black-checkbox"
        onChange={props.onCheckboxChange}
      />
      <label htmlFor="cli">
        {` Install Now's command-line interface and keep it up-to-date`}
      </label>
    </p>

    <p className="permission">
      This might require additional administrator permissions
    </p>
    <style jsx>{binaryStyles}</style>
  </div>
);

Binary.propTypes = {
  checked: bool,
  onCheckboxChange: func
};

export default Binary;
