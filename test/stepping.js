import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, MemoryRouter } from 'react-router-dom';

// a way to render any part of your app inside a MemoryRouter
// you pass it a list of steps to execute when the location
// changes, it will call back to you with stuff like
// `match` and `location`, and `history` so you can control
// the flow and make assertions.
const renderTestSequence = ({
  initialEntries,
  initialIndex,
  subject: Subject,
  steps,
  target,
}) => {
  class Assert extends React.Component {

    componentDidMount() {
      this.assert();
    }

    componentDidUpdate() {
      this.assert();
    }

    assert() {
      const nextStep = steps.shift();
      if (nextStep) {
        nextStep(Object.assign({}, this.props, target));
      } else {
        ReactDOM.unmountComponentAtNode(target);
      }
    }

    render() {
      return this.props.children;
    }
  }

  Assert.propTypes = {
    children: PropTypes.element.isRequired,
  };

  /* eslint-disable react/no-multi-comp */

  class Test extends React.PureComponent {
    componentDidCatch(error) {
      console.error(error);
    }

    render() {
      return (<MemoryRouter
        initialIndex={initialIndex}
        initialEntries={initialEntries}
      >
        <Route
          render={props => (
            <Assert {...props}>
              <Subject />
            </Assert>
          )}
        />
      </MemoryRouter>);
    }
  }

  /* eslint-enable react/no-multi-comp */

  ReactDOM.render(<Test />, target);
};

export default renderTestSequence;
