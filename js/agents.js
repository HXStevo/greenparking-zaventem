// GreenParking Zaventem - Agent/Affiliate Tracking
(function() {
    'use strict';

    var COOKIE_NAME = 'agent';
    var COOKIE_DAYS = 90;
    var config = window.AGENT_CONFIG || {};
    var DEFAULT_AGENT = config.defaultAgent || 'WT894';
    var SEARCH_AGENT = config.searchAgent || 'SRCH1';

    var seoPattern = /^[a-z]*:\/\/[^/]*(\.google\.|\.yahoo\.|\.bing\.|\.ask\.|\.aol\.|\.wow\.|\.webcrawler\.|\.mywebsearch\.|\.infospace\.|\.info\.|\.dogpile\.|\.duckduckgo\.|\.blekko\.)[^/]*/i;
    var agentPattern = /^[0-9a-z]{4,5}$/i;

    function getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i');
        var results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function setCookie(name, value, days) {
        var expiry = new Date();
        expiry.setTime(expiry.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + value + ';expires=' + expiry.toUTCString() + ';path=/';
    }

    function agentFromReferrer() {
        var referrer = document.referrer || '';
        if (referrer && seoPattern.test(referrer) && !getParameterByName('adcode') && !getParameterByName('email')) {
            return SEARCH_AGENT;
        }
        return null;
    }

    function agentFromUrl() {
        var urlAgent = getParameterByName('agent');
        if (urlAgent && agentPattern.test(urlAgent)) {
            return urlAgent.toUpperCase();
        }
        return null;
    }

    function agentFromCookie() {
        return getCookie(COOKIE_NAME) || null;
    }

    function getAgent() {
        var agent = agentFromReferrer() || agentFromUrl() || agentFromCookie() || DEFAULT_AGENT;
        setCookie(COOKIE_NAME, agent, COOKIE_DAYS);
        return agent;
    }

    // Initialize on load
    var currentAgent = getAgent();

    // Expose globally
    window.GreenParkingAgent = {
        getAgent: getAgent,
        current: currentAgent
    };
})();
