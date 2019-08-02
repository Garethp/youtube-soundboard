import React, {useEffect, useRef, useState} from 'react';
import YouTubePlayer from 'youtube-player';
import VideoForm from "./VideoForm";
import getParams from './getParams';
import OptionsForm from "./OptionsForm";

export interface VideoDefinition {
    id: string;
    title: string;
    start?: number | string,
    volume?: number | string,
}

export interface Options {
    videos: Array<VideoDefinition>;
    fade: boolean;
    fadeDuration: number;
}

let currentVideo: VideoDefinition;
const player = YouTubePlayer('player', {
    width: '100%',
});
let startVideoPromise = new Promise((resolve, reject) => {
    resolve();
});
let loopListener;

export default () => {
    let playing = false;
    const isInitialMount = useRef(true);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [editing, setEditing] = useState<VideoDefinition>();
    const [options, setOptions] = useState<Options>({
        videos: [],
        fade: false,
        fadeDuration: 2,
    });

    const fade = (startVolume: number, targetVolume: number, current: number = 0, resolve: () => any = null) => {
        const totalDuration = options.fadeDuration * 1000;
        const interval = totalDuration / 100;

        current += interval;

        const currentPercentage = (current / totalDuration) * 100;

        let newVolume = targetVolume;
        if (startVolume < targetVolume) {
            newVolume = targetVolume * (currentPercentage / 100);
        } else {
            newVolume = startVolume * ((100 - currentPercentage) / 100);
        }
        player.setVolume(newVolume);

        if (currentPercentage < 100) {
            if (!resolve) {
                return new Promise((resolve, reject) => {
                    window.setTimeout(() => fade(startVolume, targetVolume, current, resolve), interval);
                });
            }
            window.setTimeout(() => fade(startVolume, targetVolume, current, resolve), interval);
        } else {
            if (resolve) {
                resolve();
            }
        }
    };

    const loop = (event) => {
        if (event.data === 0) {
            player.playVideo();
            player.seekTo(currentVideo.start, true);
        }
    };

    const startVideo = async (video: VideoDefinition) => {
        if (currentVideo && currentVideo.id === video.id) {
            return;
        }

        startVideoPromise = startVideoPromise.then(async () => {
            if (loopListener) {
                player.off(loopListener);
                loopListener = null;
            }

            if (playing && options.fade) {
                return fade(await player.getVolume(), 0);
            }

            return;
        }).then(() => player.loadVideoById(video.id, +video.start || 0))
            .then(() => {
                player.seekTo(+video.start, true);
                player.setLoop(true);
                return new Promise((resolve, reject) => {
                    loopListener = player.on('stateChange', loop);

                    if (!options.fade) {
                        player.setVolume(+video.volume);
                        currentVideo = video;
                        resolve();
                        return;
                    }

                    player.setVolume(0);
                    const listener = player.on('stateChange', (event) => {
                        if (event.data === 1) {
                            playing = true;
                            currentVideo = video;
                            player.off(listener);
                            fade(0, +video.volume).then(() => resolve());
                        }
                    });
                });
            });
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        console.log('Update Config');
        console.log(options);

        const clean = window.location.href.replace(window.location.search, '');
        const optionsString = encodeURI(btoa(JSON.stringify(options)));
        window.history.replaceState(null, null, `${clean}?options=${optionsString}`);
    }, [options]);

    useEffect(() => {
        const params = getParams(window.location.href);

        if (params.options) {
            const options = JSON.parse(atob(params.options));

            setOptions(options);
        }
    }, []);

    const onAdd = (video: VideoDefinition) => {
        video = { id: video.id, title: video.title, start: +video.start, volume: +video.volume}

        let videos: Array<VideoDefinition> = [];
        if (options.videos.find(v => v.id === video.id)) {
            videos = [ ...options.videos.map(v => v.id === video.id ? video : v) ];
        } else {
            videos = [...options.videos, video];
        }

        setEditing(null);

        setOptions({
            ...options,
            videos,
        });
    };

    const removeVideo = (video: VideoDefinition) => {
        setOptions({
            ...options,
            videos: [
                ...options.videos.filter(v => v.id !== video.id)
            ]
        })
    };

    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: '1 0 40%'}}>
                <h3>Videos</h3>
                <ul className="list-group VideoList">
                    {options.videos.map(video => (
                        <li onClick={() => {
                            startVideo(video)
                        }} className="list-group-item">
                            {video.title}
                            <span className="float-right" onClick={(event) => {
                                removeVideo(video);
                                event.stopPropagation();
                            }}>✘</span>
                            <span className="float-right" onClick={e => { setEditing(video); e.stopPropagation(); }}>✎</span>
                        </li>
                    ))}
                </ul>
            </div>
            { showOptions &&
                <OptionsForm options={options} onUpdate={(options: Options) => setOptions(options)} setShowOptions={setShowOptions} />
            }
            { !showOptions &&
                <VideoForm onAdd={onAdd} setShowOptions={setShowOptions} editing={editing} />
            }
        </div>);
}
