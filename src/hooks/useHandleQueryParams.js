// hooks/useHandleQueryParams.js
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function useHandleQueryParams() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const choose = params.get('choose');
        const sub = params.get('sub');
        const id = params.get('id');
        const course = params.get('course');

        if (choose === 'Assignment' || choose === 'imp') {
            Cookies.set("from", "email");
            navigate(`/select?sub=${sub}&id=${id}&course=${course}&choose=${choose}`);
        }

        if (choose === 'Notes') {
            Cookies.set("from", "email");
            navigate(`/ns/${sub}/${choose}`);
        }

        // Cleanup
        ["sub", "pdfid", "course", "choose"].forEach(c => Cookies.remove(c));
    }, [navigate]);
}
