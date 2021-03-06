var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var {withRouter} = require('react-router');
var {connect} = require('react-redux');
var RecordActions = require('../store/RecordActions');
var CategoryStore = require('../store/CategoryStore');
var Typeahead = require('./Typeahead');

var CategorySelect = React.createClass({
    render() {
        var {selectedId, categoryList, ...props} = this.props;
        return (
            <select {...props}
                value={selectedId}
                onChange={this._onChange}>
                <option value="">지정 안함</option>
                {categoryList.map(category =>
                    <option value={category.id}>{category.name}</option>
                )}
            </select>
        );
    },

    _onChange(event) {
        if (this.props.onChange)
            this.props.onChange(event.target.value);
    }
});

var AddRecord = React.createClass({
    getInitialState() {
        return {
            selectedCategoryId: 0,
            statusType: 'watching',
            isRequesting: false
        };
    },

    render() {
        return <form className="record-add-form">
            <table>
                <tbody>
                <tr>
                    <th>작품 제목</th>
                    <td><input name="work_title" ref="title"
                        defaultValue={this.props.defaultTitle} /></td>
                </tr>
                <tr>
                    <th>감상 상태</th>
                    <td>
                        <select name="status_type"
                            value={this.state.statusType}
                            onChange={this._onStatusTypeChange}>
                            <option value="watching">보는 중</option>
                            <option value="finished">완료</option>
                            <option value="suspended">중단</option>
                            <option value="interested">볼 예정</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>분류</th>
                    <td>
                        <CategorySelect name="category_id"
                            categoryList={this.props.categoryList}
                            selectedId={this.state.selectedCategoryId}
                            onChange={this._onCategoryChange} />
                    </td>
                </tr>
                </tbody>
            </table>
            <button type="button"
                disabled={this.state.isRequesting}
                onClick={this._onSubmit}>
                {this.state.isRequesting ? '추가하는 중...' : '작품 추가'}
            </button>
        </form>;
    },

    componentDidMount() {
        Typeahead.initSuggest(this.refs.title);
    },

    _onCategoryChange(categoryId) {
        this.setState({selectedCategoryId: categoryId});
    },

    _onStatusTypeChange(event) {
        this.setState({statusType: event.target.value});
    },

    _onSubmit(event) {
        event.preventDefault();
        if (this.state.isRequesting)
            return;
        this.setState({isRequesting: true});
        var data = $(ReactDOM.findDOMNode(this)).serialize();
        this.props.dispatch(RecordActions.addRecord(this.props.user.name, data)).then(() => {
            this.props.onSave();
        }).always(() => {
            if (this.isMounted())
                this.setState({isRequesting: false});
        });
    }
});

var AddRecordRoute = withRouter(React.createClass({
    render() {
        // XXX: decode one more time due to react-router bug
        // https://github.com/rackt/react-router/issues/650
        var defaultTitle = decodeURIComponent(this.props.params.title || '');
        return <AddRecord
            {...this.props}
            defaultTitle={defaultTitle}
            onSave={this._onSave}
        />;
    },
    _onSave() {
        this.props.router.push(this.props.router.libraryPath);
    }
}));

function select(state) {
    return {
        categoryList: CategoryStore.getAll(state),
    };
}

module.exports = connect(select)(AddRecordRoute);
