var Router = Backbone.Router.extend({

    initialize: function () {
        this.dribbblesMap = {};
        this.dribbblesMap['popular']= new Dribbbles([], {list: 'popular'});
        this.dribbblesMap['debuts']= new Dribbbles([], {list: 'debuts'});
        this.dribbblesMap['everyone']= new Dribbbles([], {list: 'everyone'});
        $.each(this.dribbblesMap, function(index, item) {item.fetch()});
    },

    routes: {
        "popular": "popular",
        "debuts": "debuts",
        "everyone": "everyone",
        "": "chooseDefault"
    },

    chooseDefault: function () {
        Backbone.history.navigate('popular', {trigger: true});
    },

    popular: function () {
        this.routeTo('popular');
    },

    debuts: function () {
        this.routeTo('debuts')
    },

    everyone: function () {
        this.routeTo('everyone')
    },

    routeTo: function (list) {
        var body = $('body');
        body.html('');

        body.append(new HeaderView({active: list}).render().el);
        body.append(new DribbblesView({dribbbles: this.dribbblesMap[list]}).render().el)
    }
});

var Dribbbles = Backbone.Collection.extend({
    page: 1,
    initialize: function (models, options) {
        this.list = options.list;
    },
    url: function () {
        return 'http://api.dribbble.com/shots/' + this.list + '?per_page=9&page=' + this.page + '&callback=?';
    },
    parse: function (response) {
        return response.shots;
    }
});

var DribbblesView = Backbone.View.extend({

    id: 'dribbbles',
    tagName: "ul",

    initialize: function (options) {
        this.dribbbles = options.dribbbles;
        this.isLoading = false;
        var that = this;

        // periodically see if we're nearing the end of the page and load more dribbbles in
        setInterval(function () {
            that.checkScroll();
        }, 250);

        this.dribbbles.bind('add', this.addDribbble, this);
    },

    render: function () {
        var that = this;
        this.dribbbles.each(that.addDribbble, that);

        return this;
    },

    loadResults: function () {
        var that = this;

        this.isLoading = true;

        this.dribbbles.fetch({
            remove: false,
            success: function () {
                that.isLoading = false;
            },
            error: function () {
                that.isLoading = false;
            }
        });
    },

    addDribbble: function (dribbble) {
        var dribbbleView = new DribbbleView({model: dribbble})
        this.$el.append(dribbbleView.render().el);
    },

    checkScroll: function () {
        if (!this.isLoading && ($(window).scrollTop() + $(window).height() > $(document).height() - 30)) {
            this.dribbbles.page += 1; // Load next page
            this.loadResults();
        }
    }

});

var DribbbleView = Backbone.View.extend({
    tagName: "li",

    render: function () {
        this.$el.html(Templates['dribbbleViewTemplate'](this.model.attributes));
        return this;
    }
});

var HeaderView = Backbone.View.extend({
    tagName: "header",

    initialize: function (options) {
        this.active = options.active;
    },

    events: {
        "click #nav_debuts": "debuts",
        "click #nav_everyone": "everyone",
        "click #nav_popular": "popular"
    },

    popular: function () {
        Backbone.history.navigate('popular', {trigger: true})
    },

    debuts: function () {
        Backbone.history.navigate('debuts', {trigger: true});
    },

    everyone: function () {
        Backbone.history.navigate('everyone', {trigger: true})
    },

    render: function () {
        var active = {};
        active[this.active] = true;

        this.$el.html(Templates['headerViewTemplate'](active));
        return this;
    }
});

$(document).ready(function () {
    var Templates = {};

    Templates['dribbbleViewTemplate'] = Handlebars.compile($("#dribbbleViewTemplate").html());
    Templates['headerViewTemplate'] = Handlebars.compile($("#headerViewTemplate").html());

    window.Templates = Templates;

    new Router();
    Backbone.history.start();
});
