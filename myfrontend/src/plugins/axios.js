import axios from 'axios'

const instance = axios.create({ // สร้าง instance เมื่อมรการเรียกใช้ axios
    // baseURL: 'http://54.164.60.205:3000', // 1) set baseURL ไม่ต้องพิมพ์ 54.164.60.205 เองทุกครั้งเวลาเรียก
    baseURL: 'http://54.164.60.205:3000', // 1)
})

instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}` // 2) แนบ bearer token
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default instance
