import { API_BASE_URL } from '../constants/api';

// localStorage key that holds the id for each role
const STORAGE_KEYS = {
    doctor: 'doctorId',
    patient: 'patientId',
    staff: 'staffId',
    admin: 'adminId',
};

// field name /home returns the id under, per role
const RESPONSE_KEYS = {
    doctor: 'doctor_id',
    patient: 'patient_id',
    staff: 'staff_id',
    admin: 'admin_id',
};

/**
 * Resolves the signed-in user's id for the given role.
 *
 * The id is normally stored at login, but only if /home supplied it — sessions
 * created before /home returned JSON have no id cached, and a user in that state
 * would hit "Doctor ID is missing" on every action needing it until they logged
 * out and back in. So when the cache is empty this re-reads /home and stores the
 * result, letting an existing session repair itself.
 *
 * Returns the id as a string, or null if it cannot be determined.
 */
export async function resolveUserId(role) {
    const normalized = (role || '').toLowerCase();
    const storageKey = STORAGE_KEYS[normalized];

    const cached = storageKey ? localStorage.getItem(storageKey) : null;
    if (cached) return cached;

    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/home`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return null;

        // /home historically returned a plain string; only JSON carries an id.
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return null;
        }

        const id = data?.[RESPONSE_KEYS[normalized]] ?? data?.person_id ?? data?.id;
        if (id === undefined || id === null) return null;

        if (storageKey) localStorage.setItem(storageKey, String(id));
        return String(id);
    } catch {
        return null;
    }
}
