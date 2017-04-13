// Packages
import React from 'react'
import Head from 'next/head'

const Container = ({ children }) => (
  <section>
    {children}

    <Head>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::selection {
          background: #A7D8FF;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-app-region: drag;
          -webkit-user-select: none;
          margin: 0;
        }

      .slick-slider {
        position: relative;
        display: block;
        box-sizing: border-box;
        user-select: none;
        -webkit-touch-callout: none;
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
      }

      .slick-list {
        position: relative;
        display: block;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }

      .slick-list:focus {
        outline: none;
      }

      .slick-list.dragging {
        cursor: pointer;
        cursor: hand;
      }

      .slick-slider .slick-track,
      .slick-slider .slick-list {
        transform: translate3d(0, 0, 0);
      }

      .slick-track {
        position: relative;
        top: 0;
        left: 0;
        display: block;
      }

      .slick-track:before,
      .slick-track:after {
        display: table;
        content: '';
      }

      .slick-track:after {
        clear: both;
      }

      .slick-loading .slick-track {
        visibility: hidden;
      }

      .slick-slide {
        display: none;
        float: left;
        height: 100%;
        min-height: 1px;
      }

      [dir='rtl'] .slick-slide {
        float: right;
      }

      .slick-slide img {
        display: block;
      }

      .slick-slide.slick-loading img {
        display: none;
      }

      .slick-slide.dragging img {
        pointer-events: none;
      }

      .slick-initialized .slick-slide {
        display: block;
      }

      .slick-loading .slick-slide {
        visibility: hidden;
      }

      .slick-vertical .slick-slide {
        display: block;
        height: auto;
        border: 1px solid transparent;
      }

      .slick-arrow.slick-hidden {
        display: none;
      }

      .slick-initialized .slick-slide {
        height: 100vh;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .slick-arrow {
        height: 100vh !important;
        z-index: 4000;
        top: 0;
        position: fixed;
        width: 50px !important;
        display: flex !important;
        justify-content: center;
        align-items: center;
        background: linear-gradient(to left, #000, transparent);
        cursor: pointer;
        opacity: 0;
        transition: opacity .3s ease;
        -webkit-app-region: no-drag;
      }

      .slick-arrow:not(.slick-disabled) {
        opacity: .5 !important;
      }

      .slick-arrow:not(.slick-disabled):hover {
        opacity: 1 !important;
      }

      .slick-arrow.slick-prev {
        left: 0;
        transform: rotate(180deg);
      }

      .slick-arrow.slick-next {
        right: 0;
      }

      .slick-dots {
        margin: 0;
        padding: 0;
        position: fixed;
        display: flex !important;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        justify-content: center;
        align-items: center;
        list-style: none;
        z-index: 100;
      }

      .slick-dots li {
        display: block;
        -webkit-app-region: no-drag;
        margin: 0 4px;
      }

      .slick-dots li button {
        display: block;
        height: 10px;
        width: 10px;
        background: #fff;
        border: 0;
        text-indent: -999px;
        border-radius: 100%;
        padding: 0;
        opacity: .5;
        cursor: pointer;
        transition: opacity .4s;
      }

      .slick-dots li button:focus {
        outline: 0;
      }

      .slick-dots li button:hover,
      .slick-dots li.slick-active button {
        opacity: 1;
      }
      `
        }}
      />
    </Head>
  </section>
)

Container.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default Container
