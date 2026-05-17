export const EPICOLLECT_CONFIG = {
    baseUrl: 'https://five.epicollect.net/api/export/entries',
    projectSlug: 'hospital-infrastructure-mapping-kampala',
    formRef: '004763649a194fe0b26e4db270ea6a8c',
    authToken: null,
};

export async function fetchEpiCollectData(options = {}) {
    const {
        perPage = 250,
        sortOrder = 'ASC',
        filterFrom = null,
    } = options;

    if (!EPICOLLECT_CONFIG.formRef || EPICOLLECT_CONFIG.formRef === 'YOUR_FORM_REF_HERE') {
        throw new Error('EpiCollect form reference not configured. Update EPICOLLECT_CONFIG.formRef');
    }

    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const url = new URL(`${EPICOLLECT_CONFIG.baseUrl}/${EPICOLLECT_CONFIG.projectSlug}`);
        url.searchParams.append('form_ref', EPICOLLECT_CONFIG.formRef);
        url.searchParams.append('per_page', perPage);
        url.searchParams.append('page', page);
        url.searchParams.append('sort_order', sortOrder);

        if (filterFrom) {
            url.searchParams.append('filter_by', 'created_at');
            url.searchParams.append('filter_from', filterFrom);
        }

        const response = await fetch(url.toString(), {
            headers: EPICOLLECT_CONFIG.authToken
                ? { 'Authorization': `Bearer ${EPICOLLECT_CONFIG.authToken}` }
                : {},
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('Rate limited by EpiCollect API');
                break;
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const entries = json?.data?.data || [];

        if (!entries.length) {
            hasMore = false;
            break;
        }

        allData = allData.concat(entries);
        page++;
    }

    return allData;
}

export function convertEpiCollectToCSVFormat(entries) {
    if (!entries.length) return [];

    const csvRows = entries.map(entry => ({
        title: entry.title || '',
        created_at: entry.created_at || '',
        lat_2_What_is_your_locat: entry.answers?.lat_2_What_is_your_locat || '',
        long_2_What_is_your_locat: entry.answers?.long_2_What_is_your_locat || '',
        '3_Take_a_picture_of_': entry.answers?.['3_Take_a_picture_of_'] || '',
        '4_How_does_the_build': entry.answers?.['4_How_does_the_build'] || '',
        '5_Are_there_windows_': entry.answers?.['5_Are_there_windows_'] || '',
        '6_How_do_you_enter_t': entry.answers?.['6_How_do_you_enter_t'] || '',
        '7_What_type_of_road_': entry.answers?.['7_What_type_of_road_'] || '',
        '8_Can_a_car_reach_th': entry.answers?.['8_Can_a_car_reach_th'] || '',
        '9_How_clean_are_the_': entry.answers?.['9_How_clean_are_the_'] || '',
    }));

    return csvRows;
}
