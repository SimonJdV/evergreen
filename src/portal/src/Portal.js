/* eslint-disable unicorn/prefer-query-selector, no-eq-null, eqeqeq */
import React, { Component } from 'react'
import canUseDom from 'dom-helpers/util/inDOM'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const _id = 'evergreen-portal-container'

function createPortalContainer() {
  const portalContainer = document.createElement('div')
  portalContainer.id = _id
  portalContainer.setAttribute(_id, '')

  return portalContainer
}

class Portal extends Component {
  constructor(props) {
    super(props)

    // This fixes SSR
    if (!canUseDom) return

    if (this.props.contextId) {
      this.portalContainer = this.props.contextWindow.document.getElementById(
        _id
      )

      if (this.portalContainer == null) {
        this.portalContainer = createPortalContainer()
        this.props.contextWindow.document.body.append(this.portalContainer)
      }
    } else if (!this.props.contextHasPopup) {
      this.portalContainer = document.getElementById(_id)

      if (this.portalContainer == null) {
        this.portalContainer = createPortalContainer()
        document.body.append(this.portalContainer)
      }
    }

    if (this.portalContainer != null) {
      this.el = document.createElement('div')
      this.portalContainer.append(this.el)
    }
  }

  componentWillUnmount() {
    if (this.portalContainer != null) {
      this.portalContainer.removeChild(this.el)
    }
  }

  render() {
    // This fixes SSR
    if (!canUseDom || this.portalContainer == null) return null
    return ReactDOM.createPortal(this.props.children, this.el)
  }
}

Portal.propTypes = {
  children: PropTypes.node.isRequired,
  contextHasPopup: PropTypes.bool.isRequired,
  contextId: PropTypes.string,
  contextWindow: PropTypes.object
}

export const HasPopupContext = React.createContext(false)

export const WidgetContext = React.createContext({
  id: null,
  window: null
})

PortalWithContext.propTypes = {
  children: PropTypes.node.isRequired
}

export default function PortalWithContext(props) {
  return (
    <HasPopupContext.Consumer>
      {hasPopup => (
        <WidgetContext.Consumer>
          {context => (
            <Portal
              contextHasPopup={hasPopup}
              contextId={context.id}
              contextWindow={context.window}
            >
              {props.children}
            </Portal>
          )}
        </WidgetContext.Consumer>
      )}
    </HasPopupContext.Consumer>
  )
}
