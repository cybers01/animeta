webpackJsonp([3],{0:/*!********************************************!*\
  !*** ./animeta/static/js/library.react.js ***!
  \********************************************/
function(e,t,n){function r(e,t){"use strict";s.call(this),this.$RecordStore_title=e,this.$RecordStore_categoryId=t}function o(e){return"/works/"+encodeURIComponent(e)+"/"}function i(){return{title:p.getTitle(),categoryId:p.getCategoryId()}}var a=n(/*! react */27),s=n(/*! ./BaseStore */34),u=n(/*! ./AutoGrowInput */93);for(var c in s)s.hasOwnProperty(c)&&(r[c]=s[c]);var l=null===s?null:s.prototype;r.prototype=Object.create(l),r.prototype.constructor=r,r.__superConstructor__=s,r.prototype.setTitle=function(e){"use strict";this.$RecordStore_title=e,this.emitChange()},r.prototype.getTitle=function(){"use strict";return this.$RecordStore_title},r.prototype.getCategoryId=function(){"use strict";return this.$RecordStore_categoryId},r.prototype.setCategoryId=function(e){"use strict";this.$RecordStore_categoryId=e,this.emitChange()};var p,d=a.createClass({displayName:"TitleEditView",componentDidMount:function(){var e=initTypeahead(this.refs.titleInput.getDOMNode());e.on("keypress",function(e){13==e.keyCode&&this.handleSave()}.bind(this))},render:function(){return a.DOM.div({className:"title-form"},a.DOM.input({ref:"titleInput",defaultValue:this.props.originalTitle}),a.DOM.button({onClick:this.handleSave},"저장")," ",a.DOM.a({href:"#",onClick:this.handleCancel},"취소"))},handleSave:function(){this.props.onSave(this.refs.titleInput.getDOMNode().value)},handleCancel:function(e){e.preventDefault(),this.props.onCancel()}}),h=a.createClass({displayName:"CategoryEditView",render:function(){var e="지정 안함";return this.props.selectedId&&(e=this.props.categoryList.filter(function(e){return e.id==this.props.selectedId}.bind(this))[0].name),a.DOM.span({className:"category-form btn"},a.DOM.label(null,"분류: "),e," ▼",a.DOM.select({value:this.props.selectedId,onChange:this.handleChange},a.DOM.option({value:""},"지정 안함"),this.props.categoryList.map(function(e){return a.DOM.option({value:e.id},e.name)})))},handleChange:function(e){this.props.onChange(e.target.value)}}),f=a.createClass({displayName:"HeaderView",getInitialState:function(){return{isEditingTitle:!1}},render:function(){var e;return e=this.state.isEditingTitle?d({recordId:this.props.recordId,originalTitle:this.props.title,onSave:this.handleTitleSave,onCancel:function(){return this.setState({isEditingTitle:!1})}.bind(this)}):[a.DOM.h1(null,a.DOM.a({href:o(this.props.title),className:"work"},this.props.title)),a.DOM.a({href:"#",className:"btn btn-edit-title",onClick:this.handleTitleEditButtonClick},"제목 수정")],a.DOM.div({className:"record-detail-header"},e,a.DOM.a({href:"/records/"+this.props.recordId+"/delete/",className:"btn btn-delete"},"삭제"),h({categoryList:this.props.categoryList,selectedId:this.props.categoryId,onChange:this.handleCategoryChange}))},handleTitleEditButtonClick:function(e){e.preventDefault(),this.setState({isEditingTitle:!0})},handleTitleSave:function(e){$.post("/records/"+this.props.recordId+"/update/title/",{title:e}).then(function(){p.setTitle(e),this.setState({isEditingTitle:!1})}.bind(this))},handleCategoryChange:function(e){$.post("/records/"+this.props.recordId+"/update/category/",{category:e}).then(function(){p.setCategoryId(e)})}}),m=a.createClass({displayName:"StatusInputView",getInitialState:function(){return{showSuffix:!0}},render:function(){return a.DOM.span(null,this.transferPropsTo(u({minSize:3,maxSize:10,onChange:this._updateSuffix,ref:"input"})),this.state.showSuffix?"화":null,a.DOM.span({className:"plus-one",style:{cursor:"pointer"},onClick:this.handlePlusOne},a.DOM.img({src:"/static/plus.gif",alt:"+1"})))},componentDidMount:function(){this._updateSuffix()},_updateSuffix:function(){var e=this.refs.input.getDOMNode();this.setState({showSuffix:e.value.match(/^(|.*\d)$/)})},handlePlusOne:function(){var e=this.refs.input.getDOMNode(),t=plusOne(e.value);e.value=t}}),v=a.createClass({displayName:"PostComposerView",render:function(){var e;return this.props.currentStatus&&(e=a.DOM.span({className:"progress-current"},this.props.currentStatus," → ")),a.DOM.form({className:"record-detail-update",method:"post","data-connected-services":this.props.connectedServices},a.DOM.div({className:"progress"},a.DOM.select({name:"status_type",defaultValue:this.props.initialStatusType},a.DOM.option({value:"watching"},"보는 중"),a.DOM.option({value:"finished"},"완료"),a.DOM.option({value:"suspended"},"중단"),a.DOM.option({value:"interested"},"볼 예정"))," @ ",e,m({id:"id_status",name:"status",defaultValue:plusOne(this.props.currentStatus)})),a.DOM.textarea({id:"id_comment",name:"comment",rows:3,cols:30,autoFocus:!0}),a.DOM.div({className:"actions"},"공유: ",a.DOM.input({type:"checkbox",id:"id_publish_twitter",name:"publish_twitter"}),a.DOM.label({htmlFor:"id_publish_twitter"},"트위터"),a.DOM.input({type:"checkbox",id:"id_publish_facebook",name:"publish_facebook"}),a.DOM.label({htmlFor:"id_publish_facebook"},"페이스북"),a.DOM.button({type:"submit"},"기록 추가")))},componentDidMount:function(){initServiceToggles($(this.getDOMNode()))}}),g=a.createClass({displayName:"AppView",getInitialState:function(){return i()},_onChange:function(){this.setState(i())},componentDidMount:function(){p.addChangeListener(this._onChange)},render:function(){return a.DOM.div(null,f({recordId:this.props.recordId,title:this.state.title,categoryId:this.state.categoryId,categoryList:this.props.categoryList}),v({currentStatus:this.props.status,initialStatusType:this.props.statusType,connectedServices:this.props.connectedServices}))}});p=new r(APP_DATA.title,APP_DATA.categoryId),a.renderComponent(g(APP_DATA),$(".library-container")[0]),$(document).ajaxError(function(e,t){if(t.responseText)try{var n=$.parseJSON(t.responseText);return void alert(n.message)}catch(r){}alert("서버 오류로 요청에 실패했습니다.")})},34:/*!****************************************!*\
  !*** ./animeta/static/js/BaseStore.js ***!
  \****************************************/
function(e){function t(){"use strict";this.$BaseStore_listeners=[]}t.prototype.addChangeListener=function(e){"use strict";this.$BaseStore_listeners.push(e)},t.prototype.removeChangeListener=function(e){"use strict";this.$BaseStore_listeners=this.$BaseStore_listeners.filter(function(t){return t!=e})},t.prototype.emitChange=function(e){"use strict";this.$BaseStore_listeners.forEach(function(t){return t(e)})},e.exports=t},93:/*!********************************************!*\
  !*** ./animeta/static/js/AutoGrowInput.js ***!
  \********************************************/
function(e,t,n){var r=n(/*! react */27),o=r.createClass({displayName:"AutoGrowInput",getInitialState:function(){return{size:this.props.minSize}},componentDidMount:function(){this.setState({size:this.getDOMNode().value.length})},render:function(){var e=Math.max(this.props.minSize,Math.min(this.props.maxSize,this.state.size))+"em";return this.transferPropsTo(r.DOM.input({onChange:this.handleChange,style:{width:e}}))},handleChange:function(e){this.setState({size:e.target.value.length})}});e.exports=o}});
//# sourceMappingURL=library.react.js.map