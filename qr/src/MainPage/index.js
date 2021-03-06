import React from 'react'
import ReactDOM from 'react-dom'
import GoogleMapReact from 'google-map-react'
import {Toolbar, Page, Button, Row, Col, Icon} from 'react-onsenui'
import './index.css'
import R from 'ramda'
import model from '../model'

import CustomToolbar from './../CustomToolbar'
import DetailPage from './../DetailPage'
import Marker from './../Marker'

export default class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.pushPage = this.pushPage.bind(this)
    this.notify = this.notify.bind(this)
    this.toggleJoinQueue = this.toggleJoinQueue.bind(this)
    this.createMapOptions = this.createMapOptions.bind(this)
    this.model = model
  }

  componentDidMount() {
    this.model.subscribe(this)
  }

  componentWillUnmount() {
    this.model.unsubscribe(this)
  }

  notify(newState) {
    this.setState(R.merge(this.state, newState))
  }

  toggleJoinQueue(id) {
    if (model.isInQueue(id)) {
      this.model.leaveQueue(id)
    } else {
      this.model.joinQueue(id)
    }
  }

  createMapOptions(maps) {
    // next props are exposed at maps
    // "Animation", "ControlPosition", "MapTypeControlStyle", "MapTypeId",
    // "NavigationControlStyle", "ScaleControlStyle", "StrokePosition", "SymbolPath", "ZoomControlStyle",
    // "DirectionsStatus", "DirectionsTravelMode", "DirectionsUnitSystem", "DistanceMatrixStatus",
    // "DistanceMatrixElementStatus", "ElevationStatus", "GeocoderLocationType", "GeocoderStatus", "KmlLayerStatus",
    // "MaxZoomStatus", "StreetViewStatus", "TransitMode", "TransitRoutePreference", "TravelMode", "UnitSystem"
    return {
      zoomControl: false,
      fullscreenControl: false,
      mapTypeControl: false
    };
  }

  pushPage(id) {
    this.props.navigator.pushPage({component: () => <DetailPage queueId={id}/>})
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className='center'>Navigator</div>
      </Toolbar>
    )
  }

  render() {
    const { places, mapMode, user: { userCoordinates } } = this.model.getState()
    const center = userCoordinates || { lat: 59.3446561, lng: 18.0555958 }
    const zoom = 16
    const renderQueue = (place) => (
      <div key={place.id}
           className="main__list">

        <div className="left width60"
             onClick={() => this.pushPage(place.id)}>
          <p className="nomargin text-blue"><b>{place.id}</b></p>
          <small>{place.address}</small>
        </div>

        <div className="right width40">

          <div className="center inlineBlock customButtonWidth" onClick={() => this.toggleJoinQueue(place.id)}>
            <Icon icon={model.isInQueue(place.id) ? 'ion-close-circled' : 'ion-checkmark-circled'}
                      className={ 'main__icon_size ' + (model.isInQueue(place.id) ? 'text-red' : 'text-green')}>
            </Icon>
            <br />
            <small>
              { model.isInQueue(place.id)
                  ? "Leave"
                  : "Join"
              }
            </small>
          </div>

          <div className="center inlineBlock">
            <div className="main__circle bg-blue">
              <div className="main__circle_adjuster text-white">
                30
              </div>
            </div>
            <small>Mins</small>
          </div>
        </div>

        <div className="clearBoth"></div>

      </div>
    )
    const renderMarker = place => {
      return (
        <Marker
          {...place.coordinates}
          place={place}
          click={() => this.pushPage(place.id)}
          key={place.id}
        />
      )
    }
    const renderMap = () => (
      <div className='main__map-wrapper'>
        <GoogleMapReact
          center={center}
          defaultZoom={zoom}
          options={this.createMapOptions}
        >
          { places.map(renderMarker) }
        </GoogleMapReact>
      </div>
    )
    const renderList = () => (
      <div>
        <div className="custom__header">Nearby Queues</div>
        { places.map(renderQueue) }
      </div>
    )
    return (
      <Page renderToolbar={() => <CustomToolbar/>}>
        <div className="page-content">
          { mapMode
            ? renderMap()
            : renderList()
          }
        </div>
        <div className="map__button">
            <ons-icon onClick={this.model.toggleMapMode}
                    icon={mapMode ? 'ion-ios-list-outline' : 'ion-map'}
                    class="map_icon__center"></ons-icon>
        </div>
      </Page>
    )
  }
}
