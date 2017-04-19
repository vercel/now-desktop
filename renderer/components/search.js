// Packages
import React from 'react'

// Vectors
import MagnifyingGlass from '../vectors/search'
import Clear from '../vectors/clear'

class Search extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      shown: false
    }
  }

  showSearch() {
    setTimeout(() => {
      this.input.focus()
    }, 200)

    this.setState({
      shown: true
    })
  }

  render() {
    const inputRef = input => {
      this.input = input
    }

    return (
      <aside className={this.state.shown && 'visible'}>
        <span onClick={this.showSearch.bind(this)}>
          <MagnifyingGlass />
        </span>

        <form>
          <input type="text" ref={inputRef} />

          <b>
            <Clear />
          </b>
        </form>

        <style jsx>
          {`
          aside {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            display: flex;
            width: 100%;
            z-index: -200;
          }

          span {
            display: block;
            width: 37px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: .6;
            cursor: pointer;
            flex-shrink: 0;
          }

          span:hover {
            opacity: 1;
          }

          input {
            font-size: 14px;
            color: #000;
            border: 0;
            display: flex;
            border: 0;
            padding: 0;
            flex-shrink: 1;
            width: 100%;
          }

          input:focus {
            outline: none;
          }

          form {
            width: 100%;
            display: flex;
            justify-content: space-between;
            background: #fff;
            visibility: hidden;
            opacity: 0;
            transition: opacity .2s ease;
          }

          b {
            cursor: pointer;
            height: inherit;
            width: 37px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
          }

          .visible {
            z-index: 2000;
          }

          .visible form {
            visibility: visible;
            opacity: 1;
          }

          .visible span {
            opacity: 1;
            cursor: default;
          }
        `}
        </style>
      </aside>
    )
  }
}

export default Search
