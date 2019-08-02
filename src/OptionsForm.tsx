import React, {useEffect, useState} from 'react';
import {Options} from "./App";

interface OptionsFormProps {
    options: Options;
    onUpdate: (options: Options) => any;
    setShowOptions: (showOptions: boolean) => any;
}

export default ({options, onUpdate, setShowOptions}: OptionsFormProps) => {
    const [form, setForm] = useState<Options>({...options});

    useEffect(() => {
       setForm(options);
    }, [options]);

    const updateForm = (name: string, value: any) => {
        setForm({
            ...form,
            [name]: value,
        })
    };

    return (
        <div style={{ marginLeft: '50px', flex: '1 0 40%' }}>
            <h3>Options <span className="float-right" style={{ cursor: 'pointer' }} onClick={() => setShowOptions(false)}>⚙</span></h3>

            <form>
                <div className="form-group">
                    <label style={{ marginRight: '10px' }} htmlFor="fadeEnabled">Fade Enabled</label>
                    <input id="fadeEnabled" type="checkbox"
                           onChange={event => updateForm('fade', event.target.checked)}
                           checked={form.fade} />
                </div>
                <div className="form-group">
                    <label htmlFor="fadeDuration">Fade Duration</label>
                    <input id="fadeDuration" type="text" className="form-control"
                           onChange={event => updateForm('fadeDuration', event.target.value)}
                           value={form.fadeDuration}/>
                </div>
                <div className="form-group">
                    <button className="btn btn-primary" onClick={(event) => {
                        onUpdate(form);
                        event.preventDefault();
                        event.stopPropagation();
                    }}>Submit</button>
                </div>
            </form>
        </div>
    );
};
