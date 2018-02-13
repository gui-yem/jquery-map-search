/*
 mapSearch - jQuery mapSearch
 Author: gui-yem
 Version: 1.4
 Created: 29 JULY 2016

 Dependencies:
 jQuery			            version: 1.11
 googleapis             version: 3.0
 defiantjs              version: 1.4 (optional - used for native Browser JSON SEARCH)

 Custom Events:
 mapSearch:mapIsLoaded (event, plugin, map)
 mapSearch:mapFitBounds (event, plugin, map)
 mapSearch:afterSearch (event, plugin, search)
 mapSearch:afterSetMarkers (event, plugin, map)
 mapSearch:markerSelected (event, plugin, id)
 mapSearch:showMarkerOnMap (event, plugin, id)
 mapSearch:markerAddedOnList (event, plugin, item)
 mapSearch:mapDragEnd (event, plugin, map)
 mapSearch:mapZoomChanged (event, plugin, map)
 */

//Plugin
(function($) {
    //plugin
    $.fn.mapSearch = function(options, value) {
        var optExtended = $.extend({}, $.fn.mapSearch.defaults, options);
        var plugin;

        if (typeof options == 'string' && options == 'getInstance') {
            if ($(this).data('mapSearch')) {
                plugin = $.fn.mapSearch.interfaces[$(this).data('id')];
                return plugin.getInstance();
            }
        }

        return this.each(function () {
            //API of the Plugin
            if (typeof options == 'string') {
                if ($(this).data('mapSearch')) {
                    plugin = $.fn.mapSearch.interfaces[$(this).data('id')];
                    switch(options) {
                        default:
                        case 'searchFromFields':
                            plugin.searchFromFields();
                            break;
                        case 'initMap':
                            plugin.initMap();
                            break;
                    }
                }
            }
            else {
                // /new Plugin instance
                var id = $.fn.mapSearch.interfaces.length;
                $(this).data('mapSearch', true);
                $(this).data('id', id);
                plugin = new mapSearch ($(this), optExtended);
                //save instance in array of instances
                $.fn.mapSearch.interfaces[id] = plugin;
            }
        });
    }
    $.fn.mapSearch.interfaces = [];
    //Default Configuration
    $.fn.mapSearch.defaults = {
        mapScript: null,  //Specifies the map script you want to load (if you leave it blank the plugin doesn't load any map script) - String
        dataSource: {},  //The JSON Data sources - JSON
        useBrowserJSONSearch: false,  //Specifies if you want to use the browser native JSON search via defiant.js - Boolean
        jsonPrimaryNode: 'items',  //Specifies the name of the JSON Data sources primary node - String
        itemGuid: 'id',  //Specifies the name of the items GUID in the JSON Data soucres - String
        infowindowsMaxWidth: 300,  //Specifies the GoogleMap infowindow max width - Integer
        mapSearchFieldsContainer: '.container-map-search-fields', //Specifies the search fields container - String (CSS selector)
        noresultNotification: 'No result for this search criteria',  //Specifies the no result notification for search engine - String
        infowindowsTemplate: null,  //Specifies the HTML template for GoogleMap infowindow - HTML
        selectedMarkerListTemplate: null,  //Specifies the HTML template for selected markers list - HTML
        openInfoWindowOnMarkerSelect: false,  //Specifies if you want to open the GoogleMap infowindow on marker select - Boolean
        selectedMarkersListContainer: '.selected-markers-list',  //Specifies the markers list container - String (CSS selector)
        listItemsParentContainer: 'ul',  //Specifies the HTML parent container for list items (leave blank if you don't use) - String (CSS selector)
        listItemsTagName: 'li',  //Specifies the HTML list items tag name (depends of your HTML selectedMarkerListTemplate template) - String (li, div, article ...)
        selectMarkerOnListItemHover: false,  //Specifies the HTML template for GoogleMap infowindow - HTML
        boundsVisibleMarkersOnListScroll: false,  //Specifies if you want to Bounds the Map on the visible items of the Marker list - Boolean
        scrollToSelectedItemOnMarkerSelect: false,  //Specifies if you want to scroll to the selected item of the marker list on Marker select - Boolean
        listItemSelectedClass: 'selected',  //Specifies the CSS class for the selected item of the Marker list - String
        selectItemOnMarkerClick: false,  //Specifies if you want to select the item of the Marker list on Marker click - Boolean
        selectMarkerFieldLink: null,  //Specifies the ID of the HTML field you want to link to the Marker select action - String
        animateSelectedMarker: true,  //Specifies if you want to animate (BOUNCE) the selected Marker - Boolean
        animateMarkerOnListScroll: true, //Specifies if you want to animate (DROP) the visible Markers of list scroll - Boolean
        animateMarkerOnListScrollDelay: 300,  //Specifies if you want to animate (BOUNCE) the selected Marker - Boolean
        defaultMarkerIcon: null,  //Specifies the default image icon for Markers - String
        selectedMarkerIcon: null,  //Specifies the image icon for selected Marker - String
        visibleMarkerIcon: null,  //Specifies the image icon for visible (in Marker list) Markers - String
        mapFitBoundsOnWindowinfoClose: false,  //Specifies if you want to Bounds the Map on infowindow close - Boolean
        disableBoundsFromListOnMapInit: true,  //Specifies if you want to disable the Map Bounds on map initialisation - Boolean
        keepMarkerSelectedOnListScroll: false,  //Specifies if you want to keep the selected Marker on list scroll - Boolean
        displayOnlyVisibleMarkersOnListScroll: false,  //Specifies if you want to display only visible Markers on list scroll - Boolean
        initMarkersOnSearch: false,  //Specifies if you want to re-create the markers on search - Boolean
        panToSelectedMarker: true,  //Specifies if you want to pan to selected Marker - Boolean
        afterMarkerSelect: null,  //Specifies the callback function for Marker select - Function CALLBACK
        afterShowMarkerOnMap: null,  //Specifies the callback function for Show Marker on Map - Function CALLBACK
        markerAddedOnList: null,  //Specifies the callback function for Marker added on List - Function CALLBACK
        searchOnFieldsChange: false,  //Specifies if you want to launch the search on fields change - Boolean
        mapIsLoaded: null,  //Specifies the callback function for Map is loaded - Function CALLBACK
        maxBoundsZoom: null,  //Specifies the maximum level for Map Zoom on Bounds - Integer
        minBoundsZoom: null,  //Specifies the minimum level for Map Zoom on Bounds - Integer
        minBoundsZoomIncreaseLevel: null,  //Specifies an increase level when Map Zoom on Bounds is to the minimum level - Integer
        scrollToMapTopOnMarkerSelect: true,  //Specifies if you want to scroll to the Map top on Marker select - Boolean
        selectedItemScrollDuration: 300,  //Specifies the duration for list scroll to selected item - Integer
        mapSettings: {
            scrollwheel: true,
            navigationControl: true,
            mapTypeControl: true,
            scaleControl: true,
            draggable: true
        }  //Specifies the Map settings - JSON
    };

    var mapSearchPrototype = {
        init: function () {
            var self = this;
            self.dataSource = self.options.dataSource;
            self.itemGuid = self.options.itemGuid
            self.setTemplateMatchesValues(self.options.infowindowsTemplate, 'infoTemplateMatchesValues');
            if (self.options.selectedMarkerListTemplate !== null) {
                self.setTemplateMatchesValues(self.options.selectedMarkerListTemplate, 'selectedMarkerListTemplateMatchesValues');
                self.$markerList = $(self.options.selectedMarkersListContainer, self.container);
            }
            self.openedInfowindow = null;
            self.infowindows = new Object();
            self.markers = new Object();
            self.selectedMarker = null;
            self.map = null;
            self.bounds = null;
            self.$boundsVisibleListItemBtn = $('input[name="boundsVisibleListItem"]', self.container);
            self.loadDepenciesInterval = null;
            self.loadDepencies();
            self.containerTop = self.container.position().top;
            self.visibleListItems = new Array();
            self.scrollTimer = null;
            self.selectedListItem = null;
            self.disableScrollEvent = false;
            self.mouseIsOnList = false;
        },

        getInstance: function () {
            return this;
        },

        getOption: function (option) {
            var self = this;
            return self.options[option];
        },

        setOption: function (option, value) {
            var self = this;
            self.options[option] = value;
        },

        loadDepencies: function () {
            var self = this;
            // If it is the first plugin instance
            if (self.options.id == 0 && self.options.mapScript != null) {
                $.getScript(self.options.mapScript).done(function () {
                    self.initMap();
                });
            }
            else {
                if(self.mapScripIsLoaded())
                    self.initMap();
                else {
                    self.loadDepenciesInterval = setInterval(function(){
                        if(self.mapScripIsLoaded())
                            self.initMap();
                    }, 250);
                }
            }
        },

        mapScripIsLoaded: function () {
            var self = this;
            if(typeof window.google === 'object' && typeof window.google.maps === 'object')
                return true;
            else
                return false;
        },

        initMap: function () {
            var self = this;

            if (typeof self.loadDepenciesInterval !== 'undefined' && self.loadDepenciesInterval !== null)
                clearInterval(self.loadDepenciesInterval);

            self.mapId = 'map-search-' + self.options.id;
            $('.map-search', self.container).attr('id', self.mapId);
            self.map = new google.maps.Map(document.getElementById(self.mapId), self.options.mapSettings);

            google.maps.event.addListenerOnce(self.map, "zoom_changed", function() {
                self.checkZoom();
            });

            google.maps.event.addListener(self.map, "zoom_changed", function() {
                self.onMapZoom();
            });

            google.maps.event.addListener(self.map, "dragend", function() {
                self.onMapDrag();
            });

            self.setMarkers(self.dataSource[self.options.jsonPrimaryNode], true);
            // FIX map.getZoom() undefined on map init
            setTimeout(function(){ self.mapFitBounds(); }, 500);
            self.setEventListener();

            //callback for mapIsLoaded
            if (self.options.mapIsLoaded != null) {
                self.options.mapIsLoaded(self);
            }

            //Custom Event mapIsLoaded
            self.container.trigger('mapSearch:mapIsLoaded', [self, self.map]);
        },

        resetMap: function () {
            var self = this;
            self.resetAllMarkers(true, self.options.initMarkersOnSearch, false);
            self.setMarkers(self.dataSource[self.options.jsonPrimaryNode], self.options.initMarkersOnSearch);
            self.selectMarkerRelease();
        },

        mapFitBounds: function () {
            var self = this;
            self.map.fitBounds(self.bounds);
            self.checkZoom();

            //Custom Event mapFitBounds
            self.container.trigger('mapSearch:mapFitBounds', [self, self.map]);
        },

        checkZoom: function () {
            var self = this;

            var mapZoom = self.map.getZoom();
            if (typeof mapZoom === 'undefined')
                return false;

            if (self.options.minBoundsZoom != null && mapZoom < self.options.minBoundsZoom) {
                if (self.options.minBoundsZoomIncreaseLevel != null)
                    self.map.setZoom(mapZoom + self.options.minBoundsZoomIncreaseLevel);
                else
                    self.map.setZoom(self.options.minBoundsZoom);
            }

            if (self.options.maxBoundsZoom != null && mapZoom > self.options.maxBoundsZoom) {
                self.map.setZoom(self.options.maxBoundsZoom);
            }
        },

        setEventListener: function () {
            var self = this;
            $(self.options.mapSearchFieldsContainer + ' .btn-map-search', self.container).on('click', function(event) {
                self.searchFromFields();
            });

            if (self.options.searchOnFieldsChange) {
                $(self.options.mapSearchFieldsContainer + ' :input', self.container).on('change', function(event) {
                    self.searchFromFields();
                });
            }

            $(self.options.mapSearchFieldsContainer + ' .btn-map-init', self.container).on('click', function(event) {
                self.resetSearchFields();
                self.resetMap();
            });

            if (self.options.selectMarkerFieldLink != null) {
                self.setSelectedMarkerFromLinkedField();
                $(self.options.selectMarkerFieldLink).on('change', function(event) {
                    self.setSelectedMarkerFromLinkedField();
                });
            }
        },

        /*
         *
         * Search
         *
         */
        searchFromFields: function () {
            var self = this;
            self.search(self.getSearchValues());
        },

        search: function (searchValues) {
            var self = this;

            var searchQuery = self.getSearchQuery(searchValues);
            if (searchQuery == '')
                return;

            if (self.options.useBrowserJSONSearch)
                search = JSON.search(self.dataSource, searchQuery);
            else
                search = self.getSearchResults(self.dataSource, searchQuery);

            if (search.length == 0) {
                alert(self.options.noresultNotification);
                return;
            }
            self.resetAllMarkers(true, self.options.initMarkersOnSearch, false);
            self.setMarkers(search, self.options.initMarkersOnSearch);
            self.selectMarkerRelease();

            //Custom Event afterSearch
            self.container.trigger('mapSearch:afterSearch', [self, search]);
        },

        getSearchValues: function () {
            var self = this;
            var searchValues = new Object();
            searchValues.node = self.options.jsonPrimaryNode;
            if ($('.search-node', self.container).length)
                self.options.jsonPrimaryNode = $('.search-node', self.container).val();

            searchValues.fields = new Array();
            // Recovering the search parameters by browsing HTML fields of container container-map-search-fields
            $(self.options.mapSearchFieldsContainer, self.container).children().each(function () {
                var tagName = $(this).prop("tagName").toLowerCase();
                switch(tagName) {
                    case 'input':
                        searchValues.fields.push({mode: 'contains', name: $(this).attr('name'), value: $(this).val()});
                        break;
                    case 'select':
                    case 'checkbox':
                    case 'radio':
                        searchValues.fields.push({mode: 'equal', name: $(this).attr('name').replace('[]', ''), value: $(this).val()});
                        break;
                }
            });
            return searchValues;
        },

        getSearchQuery: function (searchValues) {
            var self = this;
            var query = '';
            var querys = {contains:[], equal:[]};

            $.each(searchValues.fields, function( index, item ) {
                var operator = '';
                if (query != '')
                    operator = ' and ';

                switch(item.mode) {
                    case 'contains':
                        if (item.value != '') {
                            query += operator + 'contains(' + item.name + ', "' + item.value + '")';
                            querys.contains.push([item.name, item.value]);
                        }
                        break;
                    case 'equal':
                        if (item.value != '') {
                            if (typeof item.value === 'string') {
                                query += operator + item.name + '="' + item.value + '"';
                                querys.equal.push([item.name, [item.value]]);
                            }
                            else {
                                query += operator + '(';
                                var queryValues = [];
                                $.each(item.value, function( index, value ) {
                                    multiOperator = '';
                                    if (index > 0)
                                        multiOperator = ' or ';
                                    query += multiOperator + item.name + '="' + value + '"';
                                    queryValues.push(value);
                                });
                                query += ')';
                                querys.equal.push([item.name, queryValues]);
                            }
                        }
                        break;
                }
            });

            if (query != '')
                query = '//' + searchValues.node + '[' + query + ']';
            else
                self.resetMap();

            if (!self.options.useBrowserJSONSearch && query != '')
                query = querys;

            return query;
        },

        getSearchResults: function (dataSource, querys) {
            var self = this;
            var items = [];
            var itemIds = [];

            $.each(querys.contains, function( index, query ) {
                var field = query[0];
                $.each(dataSource[self.options.jsonPrimaryNode], function( index, item ) {
                    if (item[field].toLowerCase().indexOf(query[1].toLowerCase()) != -1 && itemIds.indexOf(self.itemGuid) == -1) {
                        items.push(item);
                        itemIds.push(item[self.itemGuid]);
                    }
                });
            });

            $.each(querys.equal, function( index, query ) {
                var field = query[0];
                $.each(dataSource[self.options.jsonPrimaryNode], function( index, item ) {
                    $.each(query[1], function( index, searchValue ) {
                        if (item[field] == searchValue && itemIds.indexOf(self.itemGuid) == -1) {
                            items.push(item);
                            itemIds.push(item[self.itemGuid]);
                        }
                    });
                });
            });

            return items;
        },

        resetSearchFields: function () {
            var self = this;
            $(self.options.mapSearchFieldsContainer + ' :input', self.container)
                .not(':button, :submit, :reset, :hidden')
                .val('')
                .removeAttr('checked')
                .removeAttr('selected');
        },

        /*
         *
         * Markers
         *
         */
        setMarkers: function (datas, initMarkers) {
            var self = this;
            self.bounds = new google.maps.LatLngBounds();
            if (self.options.disableBoundsFromListOnMapInit)
                self.disableScrollEvent = true;
            self.resetSelectedMarkerList();

            for (var i=0; i<datas.length; i++) {
                if (initMarkers) {
                    self.setInfowindow(datas[i]);
                    self.setMarker(datas[i]);
                } else {
                    self.markers[datas[i][self.itemGuid]].setMap(self.map);
                    self.bounds.extend(self.markers[datas[i][self.itemGuid]].position);
                }

                if (self.options.selectedMarkerListTemplate !== null)
                    self.setSelectedMarkerList(datas[i]);
            }

            if (self.options.selectedMarkerListTemplate !== null) {
                self.setSelectedMarkerListEventListener();
                self.resetMarkerListScroll();
            }

            self.mapFitBounds();

            //Custom Event afterSetMarkers
            self.container.trigger('mapSearch:afterSetMarkers', [self, self.map]);

            setTimeout( function() {
                self.disableScrollEvent = false;
            }, 1000);
        },

        setMarker: function (item) {
            var self = this;
            var marker = new google.maps.Marker({
                map: self.map,
                position: {lat: item.lat, lng: item.lng},
                title: item.name,
                icon: self.options.defaultMarkerIcon
            });
            self.bounds.extend(marker.position);
            self.markers[item[self.itemGuid]] = marker;

            self.markers[item[self.itemGuid]].addListener('click', function() {
                self.openInfoWindow(item[self.itemGuid]);
                if (self.options.selectItemOnMarkerClick)
                    self.setSelectedListItem(item[self.itemGuid]);
            });
        },

        resetAllMarkers: function (hide, init, keepMarkerSelected) {
            var self = this;
            var i = 100;
            $.each(self.markers, function( index, value ) {
                self.closeCurrentInfoWindow();
                if (!keepMarkerSelected || self.selectedMarker == null || index != self.selectedMarker) {
                    if (hide)
                        self.markers[index].setMap(null);
                    self.markers[index].setIcon(self.options.defaultMarkerIcon);
                    self.markers[index].setAnimation(null);
                    self.markers[index].setZIndex(i++);
                }
            });
            if (init) {
                self.markers = new Object();
                self.infowindows = new Object();
            }
        },

        selectMarker: function (id) {
            var self = this;

            self.showMarkerOnMap(id);
            self.setSelectedListItem(id);
            self.setSelectedMarkerToLinkedField(id);

            //callback for afterMarkerSelect
            if (self.options.afterMarkerSelect != null) {
                self.options.afterMarkerSelect(self);
            }

            //Custom Event markerSelected
            self.container.trigger('mapSearch:markerSelected', [self, id]);
        },

        setSelectedListItem: function (id) {
            var self = this;

            if (self.options.selectedMarkerListTemplate == null)
                return;
            $(self.options.listItemsTagName + '[data-guid]', self.$markerList).removeClass(self.options.listItemSelectedClass);
            self.selectedListItem = $(self.options.listItemsTagName + '[data-guid="' + id + '"]', self.$markerList);
            self.selectedListItem.addClass(self.options.listItemSelectedClass);
            if (self.options.scrollToSelectedItemOnMarkerSelect)
                self.scrollToSelectedItem();
        },

        showMarkerOnMap: function (id) {
            var self = this;
            self.selectMarkerRelease(id);
            if (self.selectedMarker !== null && typeof self.markers[self.selectedMarker] !== 'undefined') {
                self.markers[self.selectedMarker].setAnimation(null);
                self.markers[self.selectedMarker].setIcon(self.options.defaultMarkerIcon);
                self.markers[self.selectedMarker].setZIndex(parseInt(100));
            }
            if (self.options.animateSelectedMarker)
                self.markers[id].setAnimation(google.maps.Animation.BOUNCE);
            if (self.options.selectedMarkerIcon != null)
                self.markers[id].setIcon(self.options.selectedMarkerIcon);

            self.markers[id].setZIndex(parseInt(99999));
            self.selectedMarker = id;

            if (self.options.panToSelectedMarker || (self.$boundsVisibleListItemBtn.length && !self.$boundsVisibleListItemBtn.prop('checked')))
                self.map.panTo(self.markers[id].position);

            if (self.options.scrollToMapTopOnMarkerSelect)
                $("body, html").scrollTop(self.containerTop);

            if (self.options.openInfoWindowOnMarkerSelect)
                self.openInfoWindow(id);

            //callback for afterShowMarkerOnMap
            if (self.options.afterShowMarkerOnMap != null) {
                self.options.afterShowMarkerOnMap(self);
            }

            //Custom Event showMarkerOnMap
            self.container.trigger('mapSearch:showMarkerOnMap', [self, id]);
        },

        selectMarkerRelease: function (id) {
            var self = this;
            self.closeCurrentInfoWindow();
            if (typeof self.infowindows[id] !== 'undefined' )
                self.infowindows[id].close();
            self.openedInfowindow = null;
            self.mapFitBounds(self.bounds);
        },

        setSelectedMarkerToLinkedField: function (id) {
            var self = this;

            if (self.options.selectMarkerFieldLink != null) {
                var tagName = $(self.options.selectMarkerFieldLink).prop("tagName").toLowerCase();
                switch(tagName) {
                    case 'input':
                        $(self.options.selectMarkerFieldLink).val(id);
                        break;
                    case 'select':
                        $(self.options.selectMarkerFieldLink + " option[value='" + id +"']").prop('selected', true);
                    case 'checkbox':
                    case 'radio':
                        $(self.options.selectMarkerFieldLink + " input[value='" + id +"']").prop('checked', true);
                        break;
                }
            }
        },

        setSelectedMarkerFromLinkedField: function () {
            var self = this;

            if (self.options.selectMarkerFieldLink != null) {
                var tagName = $(self.options.selectMarkerFieldLink).prop("tagName").toLowerCase();
                switch(tagName) {
                    case 'input':
                    case 'select':
                        if ($(self.options.selectMarkerFieldLink).val() != '')
                            self.selectMarker($(self.options.selectMarkerFieldLink).val());
                        break;
                    case 'checkbox':
                    case 'radio':
                        if ($(self.options.selectMarkerFieldLink + " input:checked").val() != '')
                            self.selectMarker($(self.options.selectMarkerFieldLink + " input:checked").val());
                        break;
                }
            }
        },

        /*
         *
         * Infos Windows
         *
         */
        setInfowindow: function (item) {
            var self = this;
            var content = self.getContentFromTemplate(self.options.infowindowsTemplate, self.infoTemplateMatchesValues, item);
            var infowindow = new google.maps.InfoWindow({
                content: content,
                maxWidth: self.options.infowindowsMaxWidth
            });
            self.infowindows[item[self.itemGuid]] = infowindow;

            self.infowindows[item[self.itemGuid]].addListener('closeclick',function() {
                if (self.options.mapFitBoundsOnWindowinfoClose)
                    self.mapFitBounds();
            });
        },

        openInfoWindow: function (id) {
            var self = this;
            self.closeCurrentInfoWindow();
            self.infowindows[id].open(self.map, self.markers[id]);
            self.openedInfowindow = id;
            $('#' + self.mapId + ' .btn-select-marker', self.container).off('click');
            $('#' + self.mapId + ' .btn-select-marker', self.container).on('click', function(event) {
                self.selectMarker($(this).attr('data-guid'));
            });
        },

        closeCurrentInfoWindow: function () {
            var self = this;
            if (typeof self.infowindows[self.openedInfowindow] !== 'undefined' && self.openedInfowindow !== null)
                self.infowindows[self.openedInfowindow].close();
        },

        /*
         *
         * Markers List
         *
         */
        setSelectedMarkerList: function (item) {
            var self = this;
            var content = self.getContentFromTemplate(self.options.selectedMarkerListTemplate, self.selectedMarkerListTemplateMatchesValues, item);
            if (self.options.listItemsParentContainer != null)
                $(self.options.listItemsParentContainer, self.$markerList).first().append(content);
            else
                $(self.$markerList).append(content);

            //callback for markerAddedOnList
            if (self.options.markerAddedOnList != null) {
                self.options.markerAddedOnList(self);
            }

            //Custom Event markerAddedOnList
            self.container.trigger('mapSearch:markerAddedOnList', [self, item]);
        },

        setSelectedMarkerListEventListener: function (item) {
            var self = this;
            $('.btn-view-on-map', self.$markerList).on('click', function(event) {
                self.showMarkerOnMap($(this).attr('data-guid'));
            });
            $('.btn-select-marker', self.$markerList).on('click', function(event) {
                self.selectMarker($(this).attr('data-guid'));
            });

            $(self.options.listItemsTagName + '[data-guid]', self.$markerList).on('mouseenter touchstart', function(event) {
                self.mouseIsOnList = true;
                if (self.options.selectMarkerOnListItemHover) {
                    self.openInfoWindow($(this).attr('data-guid'));
                    self.selectMarker($(this).attr('data-guid'));
                }
                if (self.options.boundsVisibleMarkersOnListScroll) {
                    self.$markerList.scroll(function() {
                        if(!self.disableScrollEvent && (!self.$boundsVisibleListItemBtn.length || self.$boundsVisibleListItemBtn.prop('checked'))) {
                            if (typeof self.scrollTimer !== 'undefined' && self.scrollTimer !== null)
                                clearTimeout(self.scrollTimer);
                            self.scrollTimer = setTimeout( function() {
                                if (self.setNewVisibleItems())
                                    self.boundsFromList(self.visibleListItems, self.options.displayOnlyVisibleMarkersOnListScroll);
                            }, 500);
                        }
                    });
                }
            });

            if (self.options.scrollToSelectedItemOnMarkerSelect) {
                self.$markerList.on('mouseenter touchstart', function(event) {
                    self.mouseIsOnList = true;
                });
                self.$markerList.on('mouseleave touchend', function(event) {
                    self.mouseIsOnList = false;
                });
            }
        },

        resetSelectedMarkerList: function (item) {
            var self = this;

            if (self.options.listItemsParentContainer != null)
                $(self.options.listItemsParentContainer, self.$markerList).first().html('');
            else
                $(self.$markerList).html('');
        },

        resetMarkerListScroll: function (item) {
            var self = this;
            self.$markerList.scrollTop(0);
        },

        setNewVisibleItems: function () {
            var self = this;
            var hasNewVisibleItem = false;
            var containerTop = self.$markerList.offset().top - 5;
            var containerBottom = containerTop + self.$markerList.height() - 5;
            var currentVisibleItems = new Array();

            $(self.options.listItemsTagName + '[data-guid]', self.$markerList).each(function () {
                var top = $(this).offset().top;
                var bottom = top + $(this).height() - 5;
                if ((top > containerTop || bottom > containerTop) && top < containerBottom) {
                    var id = $(this).attr('data-guid');
                    currentVisibleItems.push(id);
                    //if (self.visibleListItems.indexOf(id) === -1)
                    hasNewVisibleItem = true;
                }
            });
            self.visibleListItems = currentVisibleItems;

            return hasNewVisibleItem;
        },

        boundsFromList: function (items, hideMarkers) {
            var self = this;
            var i = 100;
            self.resetAllMarkers(hideMarkers, false, self.options.keepMarkerSelectedOnListScroll);

            self.bounds = new google.maps.LatLngBounds();
            $.each(items, function( index, id ) {
                self.bounds.extend(self.markers[id].position);
                if (self.options.visibleMarkerIcon != null && (!self.options.keepMarkerSelectedOnListScroll || self.selectedMarker == null || id != self.selectedMarker)) {
                    self.markers[id].setIcon(self.options.visibleMarkerIcon);
                }
                if (hideMarkers)
                    self.markers[id].setMap(self.map);
            });
            self.mapFitBounds();

            $.each(items, function( index, id ) {
                var dropDelay = setTimeout( function() {
                    if (self.options.animateMarkerOnListScroll)
                        self.markers[id].setAnimation(google.maps.Animation.DROP);
                    self.markers[id].setZIndex(parseInt(9999 + index));
                }, 200 + (index * self.options.animateMarkerOnListScrollDelay));
            });
        },

        scrollToSelectedItem: function () {
            var self = this;

            if (self.mouseIsOnList)
                return;

            self.disableScrollEvent = true;
            self.$markerList.animate({
                scrollTop: self.$markerList.scrollTop() + (self.selectedListItem.offset().top - self.$markerList.offset().top)
            }, self.options.selectedItemScrollDuration, function() {
                setTimeout( function() {
                    self.disableScrollEvent = false;
                }, 100);
            });
        },

        /*
         *
         * Map Events
         *
         */
        onMapDrag: function () {
            var self = this;

            //Custom Event mapDragEnd
            self.container.trigger('mapSearch:mapDragEnd', [self, self.map]);
        },

        onMapZoom: function () {
            var self = this;

            //Custom Event mapZoomChanged
            self.container.trigger('mapSearch:mapZoomChanged', [self, self.map]);
        },

        /*
         *
         * Utils
         *
         */
        setTemplateMatchesValues: function (template, attributeName) {
            var self = this;
            var matches = template.match(/\[\w*\]/gi);
            $.each(matches, function( index, value ) {
                matches[index] = matches[index].replace('[', '');
                matches[index] = matches[index].replace(']', '');
            });
            self[attributeName] = matches;
        },

        getContentFromTemplate: function (template, matchesValues, item) {
            var self = this;
            // Replace the shortcodes of the HTML template by the OBJECT values
            var content = template;
            $.each(matchesValues, function( index, value ) {
                content = content.replace('[' + value + ']', item[value]);
                // If Null value we hide the HTML elements linked to the data by the CSS class of the same name
                if (item[value] == '' || item[value] == null)
                    content = content.replace('class="'+value+'"', 'class="hidden"');
            });
            return content;
        }

    };

    //Constructor
    function mapSearch(container, options) {
        var self = this;
        self.container = container;
        self.options = options;
        self.options.id = container.data('id');
        self.init();
    };
    //Prototype
    mapSearch.prototype = mapSearchPrototype;

})(jQuery);
