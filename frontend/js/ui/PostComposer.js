var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var StatusInput = require('./StatusInput');
var util = require('../util');
var ExternalServiceActions = require('../store/ExternalServiceActions');
var Styles = require('./PostComposer.less');

var PostComposer = React.createClass({
    mixins: [LinkedStateMixin],

    getInitialState() {
        return {
            statusType: this.props.initialStatusType,
            status: util.plusOne(this.props.currentStatus),
            comment: '',
            publishOptions: this.props.initialPublishOptions,
            containsSpoiler: false,
        };
    },

    render() {
        var currentStatus;
        if (this.props.currentStatus) {
            currentStatus = <span className={Styles.currentProgress}>{this.props.currentStatus} &rarr; </span>;
        }
        return <form className={Styles.postComposer}>
            <div className={Styles.progress}>
                <select name="status_type"
                    valueLink={this.linkState('statusType')}>
                    <option value="watching">보는 중</option>
                    <option value="finished">완료</option>
                    <option value="suspended">중단</option>
                    <option value="interested">볼 예정</option>
                </select>
                {' @ '}
                {currentStatus}
                <StatusInput name="status"
                    value={this.state.status}
                    onChange={this._onStatusChange} />
            </div>
            <textarea name="comment" rows={3} cols={30} autoFocus
                placeholder="감상평 (선택사항)"
                valueLink={this.linkState('comment')} />
            <div className={Styles.actions}>
                <label>
                    <input type="checkbox" name="contains_spoiler"
                        checkedLink={this.linkState('containsSpoiler')} />
                    {' 내용 누설 포함'}
                </label>
                <label>
                    <input type="checkbox" name="publish_twitter"
                        checked={this._isTwitterConnected() && this.state.publishOptions.has('twitter')}
                        onChange={this._onPublishTwitterChange} />
                    {' 트위터에 공유'}
                </label>
                <button type="button" onClick={this._onSubmit}>기록 추가</button>
            </div>
        </form>;
    },

    _onSubmit(event) {
        event.preventDefault();
        this.props.onSave({
            status: this.state.status,
            status_type: this.state.statusType,
            comment: this.state.comment,
            contains_spoiler: this.state.containsSpoiler,
        }, this.state.publishOptions.intersect(this.props.connectedServices));
    },

    _onStatusChange(newValue) {
        this.setState({status: newValue});
    },

    _onPublishTwitterChange(event) {
        if (!this._isTwitterConnected()) {
            this.props.dispatch(ExternalServiceActions.connectTwitter()).then(() => {
                this.setState({publishOptions: this.state.publishOptions.add('twitter')});
            });
        } else {
            var {publishOptions} = this.state;
            if (event.target.checked) {
                publishOptions = publishOptions.add('twitter');
            } else {
                publishOptions = publishOptions.remove('twitter');
            }
            this.setState({publishOptions});
        }
    },

    _isTwitterConnected() {
        return this.props.connectedServices.has('twitter');
    }
});

module.exports = PostComposer;
