import React, {useEffect, useState} from 'react';
import {VideoDefinition} from "./App";
import set = Reflect.set;

interface VideoFormProps {
    onAdd: (video: VideoDefinition) => any;
    setShowOptions: (showOptions: boolean) => any;
    editing?: VideoDefinition
}

export default ({onAdd, setShowOptions, editing}: VideoFormProps) => {
    const [definition, setDefinition] = useState<VideoDefinition>({
        id: '',
        title: '',
        start: '',
        volume: '',
    });

    useEffect(() => {
        if (editing) {
            setDefinition(editing);
        } else {
            setDefinition({
                id: '',
                title: '',
                start: '',
                volume: '',
            })
        }
    }, [editing]);

    const updateField = (name) => (event) => {
        setDefinition({
            ...definition,
            [name]: event.target.value,
        })
    };

    return (
        <div style={{ marginLeft: '50px', flex: '1 0 40%' }}>
            <h3>Add A Video <span className="float-right" style={{ cursor: 'pointer' }} onClick={() => setShowOptions(true)}>⚙</span></h3>
            <div className="form-group">
                <input type="text" className="form-control" placeholder="VideoID" onChange={updateField('id')} value={definition.id}/>
            </div>

            <div className="form-group">
                <input type="text" className="form-control" placeholder="Name" onChange={updateField('title')} value={definition.title}/>
            </div>

            <div className="form-group">
                <input type="text" className="form-control" placeholder="Beginning (In Seconds)" onChange={updateField('start')} value={definition.start} />
            </div>

            <div className="form-group">
                <input type="text" className="form-control" placeholder="Volume" onChange={updateField('volume')} value={definition.volume} />
            </div>

            <div className="form-group">
                <button className="btn btn-primary" onClick={() => {
                    onAdd(definition);
                    setDefinition({ id: '', title: '', start: '', volume: '' });
                }}>Submit</button>
            </div>
        </div>
    );
}
