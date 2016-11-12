import React from 'react';
import { Link } from 'react-router';
import * as API from './API';

class Dashboard extends React.Component {
  state = {
    works: []
  };

  async _load(props = this.props) {
    const offset = props.location.query.offset;
    this.setState({ works: await API.getWorks({ offset }) }, () => {
      window.scrollTo(0, 0);
    });
  }

  componentDidMount() {
    this._load();
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  render() {
    const works = this.state.works;
    const offset = parseInt(this.props.location.query.offset || '0', 10);
    const nextOffset = offset + works.length;
    return (
      <div>
        <h2>Recently added</h2>

        <ul>
          {works.map(work =>
            <li key={work.id}>
              <Link to={`/works/${work.id}`}>
                {work.title}
              </Link>
              {' '}({work.record_count} records)
              {work.record_count === 0
                ? <button onClick={() => this._deleteWork(work.id)}>Delete</button>
                : null}
            </li>
          )}
        </ul>

        <p>
          <Link to={{pathname: '/', query: {offset: nextOffset}}}>Next</Link>
        </p>
      </div>
    );
  }

  _deleteWork = async (id) => {
    await API.deleteWork(id);
    this._load();
  };
}

export default Dashboard;
