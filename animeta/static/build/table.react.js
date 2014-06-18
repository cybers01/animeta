/** @jsx React.DOM */

function nullslast(val) {
    return [!val, val];
}

function keyComparator(keyFunc) {
    return function(a, b) {
        a = keyFunc(a);
        b = keyFunc(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
}

var scheduleComparator = keyComparator(function(item) {
    return nullslast(item.schedule.jp && item.schedule.jp.date);
});

var preferKRScheduleComparator = keyComparator(function(item) {
    return nullslast(item.schedule.kr && item.schedule.kr.date
        || item.schedule.jp && item.schedule.jp.date);
});

var recordCountComparator = keyComparator(function(item) {
    return -item.record_count;
});

(function(exports, initialData) {
    var listeners = [];

    exports.addChangeListener = function(listener) {
        listeners.push(listener);
    };

    exports.removeChangeListener = function(listener) {
        listeners = listeners.filter(function(obj) {
            return obj != listener;
        });
    };

    var emitChange = function() {
        listeners.forEach(function(listener) {
            listener();
        });
    };

    var items = initialData.items;
    var ordering = 'schedule';

    exports.getAllItems = function() {
        return items;
    };

    exports.getOrdering = function() {
        return ordering;
    };

    var comparatorMap = {
        'schedule': scheduleComparator,
        'schedule.kr': preferKRScheduleComparator,
        'recordCount': recordCountComparator
    };

    var sortItems = function() {
        items.sort(comparatorMap[ordering]);
    };

    exports.setOrdering = function(newOrdering) {
        ordering = newOrdering;
        sortItems();
        emitChange();
    };

    sortItems();

    exports.containsKRSchedule = function() {
        return initialData.contains_kr_schedule;
    };

    exports.favoriteItem = function(item) {
        // TODO: loading state
        return $.post('/api/v1/records', {
            work: item.title,
            status_type: 'interested'
        }).then(function(result) {
            item.record = {
                id: result.record_id
            };
            item.record_count++;
            emitChange();
        });
    };
})(ScheduleStore = {}, APP_DATA);

function formatPeriod(period) {
    var parts = period.split('Q');
    var year = parts[0], quarter = parts[1];
    return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

var HeaderView = React.createClass({displayName: 'HeaderView',
    render: function() {
        var period = formatPeriod(this.props.period);
        var self = this;
        var options;
        if (!this.props.excludeKR) {
            options = [
                {value: 'schedule', label: '날짜 (日)'},
                {value: 'schedule.kr', label: '날짜 (韓)'},
                {value: 'recordCount', label: '인기'}
            ];
        } else {
            options = [
                {value: 'schedule', label: '날짜'},
                {value: 'recordCount', label: '인기'}
            ];
        }
        var switches = options.map(function(option) {
            return React.DOM.span( {className:self.props.ordering == option.value ? 'active' : '',
                key:option.value,
                onClick:function() {
                    ScheduleStore.setOrdering(option.value);
                }}, option.label);
        });
        return (
            React.DOM.div( {className:"page-header"}, 
                React.DOM.div( {className:"settings"}, 
                    React.DOM.div( {className:"settings-item prefer-kr"}, 
                        React.DOM.label(null, "정렬: " ),
                        React.DOM.div( {className:"switch"}, 
                            switches
                        )
                    )
                ),
                React.DOM.h1( {className:"page-title"}, period, " 신작")
            )
        );
    }
});

var blazy = null;
// Disable lazy loading on mobile browsers.
if (!/i(Phone|Pad|Pod)|Android|Safari/.test(navigator.userAgent)) {
    document.documentElement.className += ' b-fade';
    blazy = new Blazy;
}

BLANK_IMG_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var blazyInvalidation = null;
function invalidateBlazy() {
    if (!blazyInvalidation) {
        blazyInvalidation = setTimeout(function() {
            blazy.revalidate();
            blazyInvalidation = null;
        }, 0);
    }
}

var ItemPosterView = React.createClass({displayName: 'ItemPosterView',
    width: 233,
    height: 318,

    render: blazy ? function() {
        return React.DOM.img( {src:BLANK_IMG_URI, 'data-src':this.props.src,
            width:this.width, height:this.height, className:"item-poster b-lazy"} );
    } : function() {
        return React.DOM.img( {src:this.props.src, width:this.width, height:this.height, className:"item-poster"} );
    },

    componentDidMount: function() {
        invalidateBlazy();
    },

    componentDidUpdate: function() {
        invalidateBlazy();
    }
});

SOURCE_TYPE_MAP = {
    'manga': '만화 원작', 
    'original': '오리지널',
    'lightnovel': '라노베 원작',
    'game': '게임 원작',
    '4koma': '4컷 만화 원작',
    'visualnovel': '비주얼 노벨 원작',
    'novel': '소설 원작'
};

function zerofill(n) {
    n = String(n);
    if (n.length == 1)
        n = '0' + n;
    return n;
}

WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function getDate(value) {
    var weekday = WEEKDAYS[value.getDay()];
    return zerofill(value.getMonth() + 1) + '/' + zerofill(value.getDate()) + ' (' + weekday + ')';
}

HOURS = [];
for (var h = 0; h < 24; h++) {
    var result;
    if (h < 12)
        result = '오전 ' + h + '시';
    else if (h == 12)
        result = '정오';
    else
        result = '오후 ' + (h - 12) + '시';
    HOURS[h] = result;
}

function getTime(value) {
    var result = HOURS[value.getHours()];
    var m = value.getMinutes();
    if (m > 0) {
        result += ' ' + zerofill(m) + '분';
    }
    return result;
}

var ScheduleView = React.createClass({displayName: 'ScheduleView',
    render: function() {
        var date, broadcasts;
        if (this.props.schedule) {
            date = this.props.schedule.date;
            if (date)
                date = new Date(date);
            broadcasts = this.props.schedule.broadcasts;
            if (broadcasts)
                broadcasts = broadcasts.join(', ');
        }
        return (
            React.DOM.div( {className:"item-schedule item-schedule-" + this.props.country}, 
                date
                    ? [React.DOM.span( {className:"date"}, getDate(date)), ' ',
                       React.DOM.span( {className:"time"}, getTime(date))]
                    : React.DOM.span( {className:"date"}, "미정"),
                ' ',
                broadcasts ? React.DOM.span( {className:"broadcasts"}, "(",broadcasts,")") : ''
            )
        );
    }
});

var FavButton = React.createClass({displayName: 'FavButton',
    render: function() {
        return (
            React.DOM.label( {className:'btn-fav' + (this.props.active ? ' active' : ''),
                onClick:this.props.onClick}, 
                React.DOM.i( {className:"fa fa-check"}),
                ' ' + this.props.count
            )
        );
    }
});

var ItemView = React.createClass({displayName: 'ItemView',
    render: function() {
        var item = this.props.item;
        var studios = item.studios ? item.studios.join(', ') : '제작사 미정';
        var source = SOURCE_TYPE_MAP[item.source];
        return (
            React.DOM.div( {className:"item"}, 
                React.DOM.div( {className:"item-inner"}, 
                    React.DOM.div( {className:"item-poster-wrap"}, 
                        ItemPosterView( {src:item.image_url} )
                    ),
                    React.DOM.div( {className:"item-frame"}, 
                        React.DOM.div( {className:"item-overlay"}, 
                            React.DOM.h3( {className:"item-title"}, item.title),
                            React.DOM.div( {className:"item-info"}, 
                                React.DOM.span( {className:"studio"}, studios),
                                source ? [' / ', React.DOM.span( {className:"source"}, source)] : ''
                            ),
                            ScheduleView( {country:"jp", schedule:item.schedule.jp} ),
                            item.schedule.kr
                                ? ScheduleView( {country:"kr", schedule:item.schedule.kr} ) : ''
                        )
                    ),
                    React.DOM.div( {className:"item-actions"}, 
                        FavButton( {active:item.record != null,
                            count:item.record_count,
                            onClick:this.handleFavButtonClick} )
                    ),
                    React.DOM.div( {className:"item-links"}, 
                    item.links.website ?
                        React.DOM.a( {href:item.links.website, className:"link link-official", target:"_blank"}, "공식 사이트")
                        : '',
                    item.links.enha ?
                        React.DOM.a( {href:item.links.enha, className:"link link-enha", target:"_blank"}, "엔하위키")
                        : '',
                    item.links.ann ?
                        React.DOM.a( {href:item.links.ann, className:"link link-ann", target:"_blank"}, "ANN (en)")
                        : ''
                    )
                )
            )
        );
    },

    handleFavButtonClick: function() {
        var self = this;
        var record = this.props.item.record;
        if (record) {
            window.open('/records/' + record.id + '/');
        } else {
            ScheduleStore.favoriteItem(this.props.item);
        }
    }
});

function getAppViewState() {
    return {
        items: ScheduleStore.getAllItems(),
        ordering: ScheduleStore.getOrdering(),
        excludeKR: !ScheduleStore.containsKRSchedule()
    };
}

var AppView = React.createClass({displayName: 'AppView',
    getInitialState: function() {
        return getAppViewState();
    },

    componentDidMount: function() {
        ScheduleStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ScheduleStore.removeChangeListener(this._onChange);
    },

    render: function() {
        return (
            React.DOM.div(null, 
                HeaderView( {period:this.props.period,
                    ordering:this.state.ordering,
                    excludeKR:this.state.excludeKR} ),

                React.DOM.div( {className:"items"}, 
                this.state.items.map(function(item) {
                    return ItemView( {item:item, key:item.id} );
                })
                )
            )
        );
    },

    _onChange: function() {
        this.setState(getAppViewState());
    }
});

React.renderComponent(
    AppView( {period:PERIOD} ),
    $('.anitable-container')[0]
);
