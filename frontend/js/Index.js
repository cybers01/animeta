var $ = require('jquery');
var React = require('react');
var {Route, IndexRoute, Link} = require('react-router');
var {createContainer} = require('./Isomorphic');
var util = require('./util');
var GlobalHeader = require('./ui/GlobalHeader');
var Grid = require('./ui/Grid');
var TimeAgo = require('./ui/TimeAgo');
var WeeklyChart = require('./ui/WeeklyChart');
var LoginDialog = require('./ui/LoginDialog');

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader currentUser={this.props.current_user} />
            {this.props.children}
        </div>;
    }
});
const AppContainer = createContainer(App, {
    getPreloadKey: () => 'chartApp',

    async fetchData(client) {
        return {
            current_user: await client.getCurrentUser(),
        };
    }
});

var Index = React.createClass({
    getInitialState() {
        return {
            posts: this.props.posts,
            isLoading: false
        };
    },
    componentDidMount() {
        // Show less posts initially in mobile
        if ($(window).width() <= 480)
            this.setState({posts: this.state.posts.slice(0, 3)});
    },
    render() {
        return <Grid.Row>
            <Grid.Column size={8} pull="left">
                {this._renderTimeline(this.state.posts)}
            </Grid.Column>
            <Grid.Column size={4} pull="right">
                <WeeklyChart data={this.props.chart} />
            </Grid.Column>
        </Grid.Row>;
    },
    _renderTimeline(posts) {
        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else {
            loadMore = <div className="load-more" onClick={this._loadMore}>더 보기</div>;
        }

        return <div className="timeline">
            <h2 className="section-title">최근 감상평</h2>
            {posts.map(this._renderPost)}
            {loadMore}
        </div>;
    },
    _renderPost(post) {
        return <div className="post-item">
            <div className="meta">
                <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
                <i className="fa fa-caret-right separator" />
                <Link to={util.getWorkURL(post.record.title)} className="work">{post.record.title}</Link>
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <div className="comment">
                {post.comment}
            </div>
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        $.get('/api/v2/posts', {
            before_id: this.state.posts[this.state.posts.length - 1].id,
            min_record_count: 2
        }).then(data => {
            this.setState({
                isLoading: false,
                posts: this.state.posts.concat(data)
            });
        });
    }
});
const IndexContainer = createContainer(Index, {
    getPreloadKey: () => 'index',

    async fetchData(client) {
        const [posts, chart] = await* [
            client.call('/posts', {
                min_record_count: 2,
                count: 10
            }),
            client.call('/charts/works/weekly', {limit: 5}),
        ];
        return {posts, chart};
    }
});

var routes = <Route component={AppContainer} path="/">
    <IndexRoute component={IndexContainer} />
    <Route component={() => <LoginDialog next="/" />} path="/login/" />
    <Route component={require('./ui/SignupRoute')} path="/signup/" />
    {require('./ChartRoute')}
    {require('./WorkRoute')}
</Route>;

module.exports = {
    routes
};
