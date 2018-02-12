# jquery-map-search
jQuery plugin to search on a Google Map markers list + zoom on list item visible (scrolling effect)

## Dependencies :
jQuery			              version: 1.11<br>
googleapis             version: 3.0<br>
defiantjs              version: 1.4 (optional - used for native Browser JSON SEARCH)

## Custom Events :
mapSearch:mapIsLoaded (event, plugin, map)<br>
mapSearch:mapFitBounds (event, plugin, map)<br>
mapSearch:afterSearch (event, plugin, search)<br>
mapSearch:afterSetMarkers (event, plugin, map)<br>
mapSearch:markerSelected (event, plugin, id)<br>
mapSearch:showMarkerOnMap (event, plugin, id)<br>
mapSearch:markerAddedOnList (event, plugin, item)<br>

## Options : 
```javascript
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
```
## Demo : 
[EXAMPLE](http://jquery.demos-sites.net/map-search/example.html)
