import React, { useEffect, useRef, useState } from 'react';
import styles from './WalkMap.module.css';

const { kakao } = window;

const WalkMap = ({ searchPlace }) => {
  const [kakaoMap, setKakaoMap] = useState(null);
  const [kakaoInfoWindow, setKakaoInfoWindow] = useState(null);
  const [kakaoMapTypeControl, setKakaoMapTypeControl] = useState(null);
  const [kakaoZoomControl, setKakaoZoomControl] = useState(null);
  const [kakaoPs, setKakaoPs] = useState(null);
  const [kakaoMapSettings, setKakaoMapSettings] = useState(false);
  const [markerPositions, setMarkerPositions] = useState([]);

  const container = useRef();

  const getCurrentLocation = () => {
    // 현재 위치 가져오기
    let lat;
    let lon;
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    });
    console.log([lat, lon]);
  };

  // 맵 및 초기설정 생성
  useEffect(() => {
    const currentLocation = getCurrentLocation();
    console.log('current', currentLocation);
    const options = {
      center: new kakao.maps.LatLng(1, 2),
      level: 3,
    };

    // infowindow객체, 맵, 검색, 컨트롤 객체 생성
    const map = new kakao.maps.Map(container.current, options);
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    const ps = new kakao.maps.services.Places();
    const mapTypeControl = new kakao.maps.MapTypeControl();
    const zoomControl = new kakao.maps.ZoomControl();
    // 객체 상태저장 (재활용)
    setKakaoMap(map);
    setKakaoInfoWindow(infowindow);
    setKakaoPs(ps);
    setKakaoMapTypeControl(mapTypeControl);
    setKakaoZoomControl(zoomControl);
    console.log('맵 생성!');
  }, [container]);

  useEffect(() => {
    if (kakaoMap === null || kakaoMapSettings === true) {
      return;
    }
    setKakaoMapSettings(true);
    // 맵에 컨트롤러 추가
    kakaoMap.addControl(
      kakaoMapTypeControl,
      kakao.maps.ControlPosition.TOPRIGHT
    );
    kakaoMap.addControl(kakaoZoomControl, kakao.maps.ControlPosition.RIGHT);

    // 마우스 이벤트 등록
    kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      console.log(latlng);
    });

    // 컨트롤러, 마우스 이벤트 중복추가 방지
    setKakaoMapSettings(true);
  });

  useEffect(() => {
    if (kakaoPs === null) {
      return;
    }

    //검색 함수
    const placesSearchCB = (data, status) => {
      let bounds = new kakao.maps.LatLngBounds();
      for (let i = 0; i < data.length; i++) {
        displayMarker(data[i]);
        bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
      }
      kakaoMap.setBounds(bounds);
      if (status === kakao.maps.services.Status.OK) {
        const newMarkerPositions = data.map((pos) => {
          return [pos.x, pos.y];
        });
        setMarkerPositions(newMarkerPositions);
      }
    };

    // 마커표시 함수
    const displayMarker = (place) => {
      let marker = new kakao.maps.Marker({
        map: kakaoMap,
        position: new kakao.maps.LatLng(place.y, place.x),
      });
    };

    kakaoPs.keywordSearch(searchPlace, placesSearchCB);
  }, [searchPlace]);

  return <div id='container' ref={container} className={styles.walkMap} />;
};
export default WalkMap;
