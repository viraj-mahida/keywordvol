'use client';

import styles from './page.module.css'
import { useEffect, useState } from 'react';

export default function Home() {
  const API_KEY = process.env.YT_API_KEY_3; //2
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allVideos, setAllVideos] = useState(null);
  const [monthVideos, setMonthVideos] = useState(null);

  // all time search data
  const fetchAllTimeVideosData = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(searchKeyword)}&key=${API_KEY}&regionCode=IN&maxResults=50&type=video`
      );
      const data = await response.json();
      setAllVideos(data)
      // return data.pageInfo.totalResults;
      return data;
    } catch (error) {
      console.error('Error fetching keyword search volume:', error);
      return 0;
    }
  }

  // monthly upladed serach data
  const fetchLastMonthVideoData = async (searchKeyword) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchKeyword)}&type=video&regionCode=IN&publishedAfter=${getLastMonthDate()}&key=${API_KEY}&maxResults=50`
      );
      const data = await response.json();
      setMonthVideos(data)
      return data;
    } catch (error) {
      console.error('Error fetching video data:', error);
      return [];
    }
  };

  // Function to get the date of one month ago in ISO8601 format
  const getLastMonthDate = () => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    return currentDate.toISOString();
  };

  // get view of each video
  const getVideoViews = async (videoId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&key=${API_KEY}&id=${videoId}`
      );
      const data = await response.json();
      // setMonthVideos(data)
      return data.items[0].statistics.viewCount;
    } catch (error) {
      console.error('Error fetching video data:', error);
      return [];
    }
  };

  const [lastMonthAvgView, setLastMonthAvgView] = useState(1)
  const [allTimeAvgView, setAllTimeAvgView] = useState(1)

  const countAvgView = async () => {
    // all time
    if (allVideos && allVideos.items) {
      const allTimeVideoViews = await Promise.all(
        allVideos.items.map(async (item) => {
          const views = await getVideoViews(item.id.videoId);
          return parseInt(views);
        })
      );
      const totalAllTimeViews = allTimeVideoViews.reduce((sum, views) => sum + views, 0);
      // const allTimeAvg = totalAllTimeViews / allTimeVideoViews.length;
      setAllTimeAvgView(totalAllTimeViews);
    }

    // month
    if (monthVideos && monthVideos.items) {
      const monthVideoViews = await Promise.all(
        monthVideos.items.map(async (item) => {
          const views = await getVideoViews(item.id.videoId);
          return parseInt(views);
        })
      );
      const totalMonthViews = monthVideoViews.reduce((sum, views) => sum + views, 0);
      // const monthAvg = totalMonthViews / monthVideoViews.length;
      setLastMonthAvgView(totalMonthViews);
    }
  };

  // const monthlyKeywordVolume = () => {
  //   let final = (allTimeAvgView < lastMonthAvgView) ? allTimeAvgView : lastMonthAvgView
  //   if (allTimeAvgView > 1 && lastMonthAvgView > 1) {
  //     // ((allTimeAvgView) + (lastMonthAvgView) +
  //     //   (allVideos.pageInfo.totalResults) +
  //     //   (monthVideos.pageInfo.totalResults)
  //     //   );
  //     // (((allTimeAvgView / 100) + lastMonthAvgView) / 2) +
  //     // (allVideos.pageInfo.totalResults / 100) +
  //     // (monthVideos.pageInfo.totalResults / 100);

  //     // if ((parseInt(final, 10)) > 1000000) {
  //     //   console.log((parseInt(final, 10)));
  //     //   return (parseInt(final, 10)) / 100;
  //     // }
  //     // else if ((parseInt(final, 10)) > 100000) {
  //     //   console.log((parseInt(final, 10)));
  //     //   return (parseInt(final, 10)) / 10;
  //     // }
  //     // else {
  //     //   console.log((parseInt(final, 10)));
  //     //   return (parseInt(final, 10));
  //     // }
  //     return (parseInt(final, 10));
  //   }
  // }

  const [finalAns, setFinalAns] = useState(null);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    fetchAllTimeVideosData();
    fetchLastMonthVideoData();
    countAvgView();
    setTimeout(() => {
      setButtonDisabled(false);
      // setFinalAns();
    }, 2000);
  }


  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "500px" }}>
        <h1>Keyword Search Volume</h1>
        <form action="" onSubmit={(e) => handleOnSubmit(e)}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Enter a keyword"
          />
          {/* <button onClick={() => setSearchVolume(fetchAllTimeVideosData())}>Search</button> */}
          <button disabled={isButtonDisabled} onClick={(e) => handleOnSubmit(e)}>Search</button>
        </form>
        
        {allTimeAvgView > 1 && lastMonthAvgView > 1 && monthVideos?.pageInfo && allVideos?.pageInfo ? (
          // <p>
          //   Estimated Monthly Search volume for <strong>{searchKeyword}</strong> is <strong>{finalAns}</strong>.
          //   <br /><br />
          //   Considered below data for this estimation:
          //   <br /><br />
          //   Sum of Last Month Views of <strong>{monthVideos.pageInfo.resultsPerPage < allVideos.pageInfo.resultsPerPage ? monthVideos.pageInfo.resultsPerPage : allVideos.pageInfo.resultsPerPage}</strong> videos: <strong>{lastMonthAvgView < allTimeAvgView ? lastMonthAvgView : allTimeAvgView}</strong>
          //   <br /><br />
          //   Sum of All Time Views of <strong>{monthVideos.pageInfo.resultsPerPage > allVideos.pageInfo.resultsPerPage ? monthVideos.pageInfo.resultsPerPage : allVideos.pageInfo.resultsPerPage}</strong> videos: <strong>{lastMonthAvgView > allTimeAvgView ? lastMonthAvgView : allTimeAvgView}</strong>
          //   <br /><br />
          //   Total All Time Results: <strong>{allVideos.pageInfo.totalResults > monthVideos.pageInfo.totalResults ? allVideos.pageInfo.totalResults : monthVideos.pageInfo.totalResults}</strong>
          //   <br /><br />
          //   Last Month Results: <strong>{allVideos.pageInfo.totalResults < monthVideos.pageInfo.totalResults ? allVideos.pageInfo.totalResults : monthVideos.pageInfo.totalResults}</strong>
          // </p>
          <p>
            <br />
            Estimated Monthly Search volume for <strong>{searchKeyword}</strong> is <strong>{lastMonthAvgView < allTimeAvgView ? parseInt(lastMonthAvgView/2, 10) : parseInt(allTimeAvgView/2, 10)}</strong>.
            <br />
          </p>

        ) : (
          <p>Please enter a keyword and click <strong>Search</strong> to get the estimated monthly search volume.
            <br />
            <br />
            NOTE: It seems that the button is not functioning properly on its initial click after a reload. Due to time constraints, I have not been able to address this issue yet. I apologize for any inconvenience this may cause.
          </p>
        )}

      </div>
    </main>
  )
}
