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

  show() {
    setTimeout(() => {
      this.input.focus()
    }, 200)

    this.form.style.visibility = 'visible'

    this.setState({
      shown: true
    })
  }

  hide() {
    this.setState({
      shown: false
    })

    setTimeout(() => {
      this.form.style.visibility = 'hidden'
      this.input.value = ''
      this.input.blur()
    }, 200)
  }

  render() {
    const inputRef = input => {
      this.input = input
    }

    const formRef = form => {
      this.form = form
    }

    return (
      <aside className={this.state.shown && 'visible'}>
        <span onClick={this.show.bind(this)}>
          <MagnifyingGlass />
        </span>

        <form ref={formRef}>
          <input
            type="text"
            ref={inputRef}
            placeholder="Search the Timeline..."
          />

          <b onClick={this.hide.bind(this)}>
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
