const BACKEND_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface CityConfig {
	name: string;
	slug: string;
	endpoint: string;
	region?: string;
	id: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
}

export const CITY_DATA: Record<string, CityConfig> = {
	"Hà Nội": {
		name: "Hà Nội",
		slug: "ha-noi",
		endpoint: `${BACKEND_URL}/weather/hanoi`,
		region: "Miền Bắc",
		id: "hanoi",
		coordinates: {
			latitude: 21.0278,
			longitude: 105.8342
		}
	},
	"Hồ Chí Minh": {
		name: "Hồ Chí Minh",
		slug: "ho-chi-minh",
		endpoint: `${BACKEND_URL}/weather/hochiminh`,
		region: "Miền Nam",
		id: "hochiminh",
		coordinates: {
			latitude: 10.8231,
			longitude: 106.6297
		}
	},
	"Đà Nẵng": {
		name: "Đà Nẵng",
		slug: "da-nang",
		endpoint: `${BACKEND_URL}/weather/danang`,
		region: "Miền Trung",
		id: "danang",
		coordinates: {
			latitude: 16.0544,
			longitude: 108.2022
		}
	},
	"Hải Phòng": {
		name: "Hải Phòng",
		slug: "hai-phong",
		endpoint: `${BACKEND_URL}/weather/haiphong`,
		region: "Miền Bắc",
		id: "haiphong",
		coordinates: {
			latitude: 20.8449,
			longitude: 106.6881
		}
	},
	"Cần Thơ": {
		name: "Cần Thơ",
		slug: "can-tho",
		endpoint: `${BACKEND_URL}/weather/cantho`,
		region: "Miền Nam",
		id: "cantho",
		coordinates: {
			latitude: 10.0452,
			longitude: 105.7469
		}
	},
	Huế: {
		name: "Huế",
		slug: "hue",
		endpoint: `${BACKEND_URL}/weather/hue`,
		region: "Miền Trung",
		id: "hue",
		coordinates: {
			latitude: 16.4637,
			longitude: 107.5909
		}
	},
	"Nha Trang": {
		name: "Nha Trang",
		slug: "nha-trang",
		endpoint: `${BACKEND_URL}/weather/nhatrang`,
		region: "Miền Trung",
		id: "nhatrang",
		coordinates: {
			latitude: 12.2388,
			longitude: 109.1967
		}
	},
	"Đà Lạt": {
		name: "Đà Lạt",
		slug: "da-lat",
		endpoint: `${BACKEND_URL}/weather/dalat`,
		region: "Miền Nam",
		id: "dalat",
		coordinates: {
			latitude: 11.9404,
			longitude: 108.4583
		}
	},
	Sapa: {
		name: "Sa Pa",
		slug: "sa-pa",
		endpoint: `${BACKEND_URL}/weather/sapa`,
		region: "Miền Bắc",
		id: "sapa",
		coordinates: {
			latitude: 22.3364,
			longitude: 103.8438
		}
	},
	// Thêm các thành phố mới (ẩn khỏi trang chủ)
	"Phan Thiết": {
		name: "Phan Thiết",
		slug: "phan-thiet",
		endpoint: `${BACKEND_URL}/weather/phanthiet`,
		region: "Miền Trung",
		id: "phanthiet",
		coordinates: {
			latitude: 10.9804,
			longitude: 108.2558
		}
	},
	"Vinh": {
		name: "Vinh",
		slug: "vinh",
		endpoint: `${BACKEND_URL}/weather/vinh`,
		region: "Miền Trung",
		id: "vinh",
		coordinates: {
			latitude: 18.6790,
			longitude: 105.6819
		}
	},
	"Vũng Tàu": {
		name: "Vũng Tàu",
		slug: "vung-tau",
		endpoint: `${BACKEND_URL}/weather/vungtau`,
		region: "Miền Nam",
		id: "vungtau",
		coordinates: {
			latitude: 10.3460,
			longitude: 107.0843
		}
	},
	"Hạ Long": {
		name: "Hạ Long",
		slug: "ha-long",
		endpoint: `${BACKEND_URL}/weather/halong`,
		region: "Miền Bắc",
		id: "halong",
		coordinates: {
			latitude: 20.9734,
			longitude: 107.0299
		}
	},
	"Thanh Hóa": {
		name: "Thanh Hóa",
		slug: "thanh-hoa",
		endpoint: `${BACKEND_URL}/weather/thanhhoa`,
		region: "Miền Bắc",
		id: "thanhhoa",
		coordinates: {
			latitude: 19.8066,
			longitude: 105.7852
		}
	},
	"Quảng Ngãi": {
		name: "Quảng Ngãi",
		slug: "quang-ngai",
		endpoint: `${BACKEND_URL}/weather/quangngai`,
		region: "Miền Trung",
		id: "quangngai",
		coordinates: {
			latitude: 15.1213,
			longitude: 108.8061
		}
	},
	"Biên Hòa": {
		name: "Biên Hòa",
		slug: "bien-hoa",
		endpoint: `${BACKEND_URL}/weather/bienhoa`,
		region: "Miền Nam",
		id: "bienhoa",
		coordinates: {
			latitude: 10.9574,
			longitude: 106.8426
		}
	},
	"Rạch Giá": {
		name: "Rạch Giá",
		slug: "rach-gia",
		endpoint: `${BACKEND_URL}/weather/rachgia`,
		region: "Miền Nam",
		id: "rachgia",
		coordinates: {
			latitude: 10.0123,
			longitude: 105.0921
		}
	},
	"Quy Nhơn": {
		name: "Quy Nhơn",
		slug: "quy-nhon",
		endpoint: `${BACKEND_URL}/weather/quynhon`,
		region: "Miền Trung",
		id: "quynhon",
		coordinates: {
			latitude: 13.7695,
			longitude: 109.2105
		}
	},
	"Bà Rịa": {
		name: "Bà Rịa",
		slug: "ba-ria",
		endpoint: `${BACKEND_URL}/weather/baria`,
		region: "Miền Nam",
		id: "baria",
		coordinates: {
			latitude: 10.5014,
			longitude: 107.1686
		}
	},
	"Bạc Liêu": {
		name: "Bạc Liêu",
		slug: "bac-lieu",
		endpoint: `${BACKEND_URL}/weather/baclieu`,
		region: "Miền Nam",
		id: "baclieu",
		coordinates: {
			latitude: 9.2853,
			longitude: 105.7234
		}
	},
	"Buôn Ma Thuột": {
		name: "Buôn Ma Thuột",
		slug: "buon-ma-thuot",
		endpoint: `${BACKEND_URL}/weather/buonmathuot`,
		region: "Miền Trung",
		id: "buonmathuot",
		coordinates: {
			latitude: 12.6797,
			longitude: 108.0514
		}
	},
	"Cam Ranh": {
		name: "Cam Ranh",
		slug: "cam-ranh",
		endpoint: `${BACKEND_URL}/weather/camranh`,
		region: "Miền Trung",
		id: "camranh",
		coordinates: {
			latitude: 11.9214,
			longitude: 109.1591
		}
	},
	"Cao Bằng": {
		name: "Cao Bằng",
		slug: "cao-bang",
		endpoint: `${BACKEND_URL}/weather/caobang`,
		region: "Miền Bắc",
		id: "caobang",
		coordinates: {
			latitude: 22.6659,
			longitude: 106.2518
		}
	},
	"Cẩm Phả": {
		name: "Cẩm Phả",
		slug: "cam-pha",
		endpoint: `${BACKEND_URL}/weather/campha`,
		region: "Miền Bắc",
		id: "campha",
		coordinates: {
			latitude: 21.0167,
			longitude: 107.2667
		}
	},
	"Điện Biên Phủ": {
		name: "Điện Biên Phủ",
		slug: "dien-bien-phu",
		endpoint: `${BACKEND_URL}/weather/dienbienphu`,
		region: "Miền Bắc",
		id: "dienbienphu",
		coordinates: {
			latitude: 21.3856,
			longitude: 103.0320
		}
	},
	"Hà Đông": {
		name: "Hà Đông",
		slug: "ha-dong",
		endpoint: `${BACKEND_URL}/weather/hadong`,
		region: "Miền Bắc",
		id: "hadong",
		coordinates: {
			latitude: 20.9709,
			longitude: 105.7791
		}
	},
	"Đồng Xoài": {
		name: "Đồng Xoài",
		slug: "dong-xoai",
		endpoint: `${BACKEND_URL}/weather/dongxoai`,
		region: "Miền Nam",
		id: "dongxoai",
		coordinates: {
			latitude: 11.5344,
			longitude: 106.8937
		}
	},
	"Đồng Hới": {
		name: "Đồng Hới",
		slug: "dong-hoi",
		endpoint: `${BACKEND_URL}/weather/dongho`,
		region: "Miền Trung",
		id: "dongho",
		coordinates: {
			latitude: 17.4825,
			longitude: 106.6005
		}
	},
	"Hà Tĩnh": {
		name: "Hà Tĩnh",
		slug: "ha-tinh",
		endpoint: `${BACKEND_URL}/weather/hatinh`,
		region: "Miền Trung",
		id: "hatinh",
		coordinates: {
			latitude: 18.3560,
			longitude: 105.8877
		}
	},
	"Hải Dương": {
		name: "Hải Dương",
		slug: "hai-duong",
		endpoint: `${BACKEND_URL}/weather/haiduong`,
		region: "Miền Bắc",
		id: "haiduong",
		coordinates: {
			latitude: 20.9399,
			longitude: 106.3309
		}
	},
	"Hòa Bình": {
		name: "Hòa Bình",
		slug: "hoa-binh",
		endpoint: `${BACKEND_URL}/weather/hoabinh`,
		region: "Miền Bắc",
		id: "hoabinh",
		coordinates: {
			latitude: 20.8132,
			longitude: 105.3382
		}
	},
	"Hội An": {
		name: "Hội An",
		slug: "hoi-an",
		endpoint: `${BACKEND_URL}/weather/hoian`,
		region: "Miền Trung",
		id: "hoian",
		coordinates: {
			latitude: 15.8800,
			longitude: 108.3380
		}
	},
	"Lai Châu": {
		name: "Lai Châu",
		slug: "lai-chau",
		endpoint: `${BACKEND_URL}/weather/laichau`,
		region: "Miền Bắc",
		id: "laichau",
		coordinates: {
			latitude: 22.3964,
			longitude: 103.4591
		}
	},
	"Lạng Sơn": {
		name: "Lạng Sơn",
		slug: "lang-son",
		endpoint: `${BACKEND_URL}/weather/langson`,
		region: "Miền Bắc",
		id: "langson",
		coordinates: {
			latitude: 21.8534,
			longitude: 106.7614
		}
	},
	"Lào Cai": {
		name: "Lào Cai",
		slug: "lao-cai",
		endpoint: `${BACKEND_URL}/weather/laocai`,
		region: "Miền Bắc",
		id: "laocai",
		coordinates: {
			latitude: 22.4856,
			longitude: 103.9754
		}
	},
	"Long Xuyên": {
		name: "Long Xuyên",
		slug: "long-xuyen",
		endpoint: `${BACKEND_URL}/weather/longxuyen`,
		region: "Miền Nam",
		id: "longxuyen",
		coordinates: {
			latitude: 10.3860,
			longitude: 105.4380
		}
	},
	"Mỹ Tho": {
		name: "Mỹ Tho",
		slug: "my-tho",
		endpoint: `${BACKEND_URL}/weather/mytho`,
		region: "Miền Nam",
		id: "mytho",
		coordinates: {
			latitude: 10.3602,
			longitude: 106.3557
		}
	},
	"Ninh Bình": {
		name: "Ninh Bình",
		slug: "ninh-binh",
		endpoint: `${BACKEND_URL}/weather/ninhbinh`,
		region: "Miền Bắc",
		id: "ninhbinh",
		coordinates: {
			latitude: 20.2579,
			longitude: 105.9744
		}
	},
	"Phan Rang - Tháp Chàm": {
		name: "Phan Rang - Tháp Chàm",
		slug: "phan-rang-thap-cham",
		endpoint: `${BACKEND_URL}/weather/phanrangthapcham`,
		region: "Miền Trung",
		id: "phanrangthapcham",
		coordinates: {
			latitude: 11.5639,
			longitude: 108.9880
		}
	},
	"Pleiku": {
		name: "Pleiku",
		slug: "pleiku",
		endpoint: `${BACKEND_URL}/weather/pleiku`,
		region: "Miền Trung",
		id: "pleiku",
		coordinates: {
			latitude: 13.9833,
			longitude: 108.0000
		}
	},
	"Sa Đéc": {
		name: "Sa Đéc",
		slug: "sa-dec",
		endpoint: `${BACKEND_URL}/weather/sadec`,
		region: "Miền Nam",
		id: "sadec",
		coordinates: {
			latitude: 10.2931,
			longitude: 105.7548
		}
	},
	"Sóc Trăng": {
		name: "Sóc Trăng",
		slug: "soc-trang",
		endpoint: `${BACKEND_URL}/weather/soctrang`,
		region: "Miền Nam",
		id: "soctrang",
		coordinates: {
			latitude: 9.6037,
			longitude: 105.9699
		}
	},
	"Tam Điệp": {
		name: "Tam Điệp",
		slug: "tam-diep",
		endpoint: `${BACKEND_URL}/weather/tamdiep`,
		region: "Miền Bắc",
		id: "tamdiep",
		coordinates: {
			latitude: 20.1567,
			longitude: 105.9500
		}
	},
	"Tân An": {
		name: "Tân An",
		slug: "tan-an",
		endpoint: `${BACKEND_URL}/weather/tanan`,
		region: "Miền Nam",
		id: "tanan",
		coordinates: {
			latitude: 10.5347,
			longitude: 106.4042
		}
	},
	"Thái Bình": {
		name: "Thái Bình",
		slug: "thai-binh",
		endpoint: `${BACKEND_URL}/weather/thaibinh`,
		region: "Miền Bắc",
		id: "thaibinh",
		coordinates: {
			latitude: 20.4500,
			longitude: 106.3333
		}
	},
	"Thái Nguyên": {
		name: "Thái Nguyên",
		slug: "thai-nguyen",
		endpoint: `${BACKEND_URL}/weather/thainguyen`,
		region: "Miền Bắc",
		id: "thainguyen",
		coordinates: {
			latitude: 21.5944,
			longitude: 105.8472
		}
	},
	"Thủ Dầu Một": {
		name: "Thủ Dầu Một",
		slug: "thu-dau-mot",
		endpoint: `${BACKEND_URL}/weather/thudaumot`,
		region: "Miền Nam",
		id: "thudaumot",
		coordinates: {
			latitude: 10.9804,
			longitude: 106.6519
		}
	},
	"Tuy Hòa": {
		name: "Tuy Hòa",
		slug: "tuy-hoa",
		endpoint: `${BACKEND_URL}/weather/tuyhoa`,
		region: "Miền Trung",
		id: "tuyhoa",
		coordinates: {
			latitude: 13.0967,
			longitude: 109.3000
		}
	},
	"Tuyên Quang": {
		name: "Tuyên Quang",
		slug: "tuyen-quang",
		endpoint: `${BACKEND_URL}/weather/tuyenquang`,
		region: "Miền Bắc",
		id: "tuyenquang",
		coordinates: {
			latitude: 21.8236,
			longitude: 105.2181
		}
	},
	"Uông Bí": {
		name: "Uông Bí",
		slug: "uong-bi",
		endpoint: `${BACKEND_URL}/weather/uongbi`,
		region: "Miền Bắc",
		id: "uongbi",
		coordinates: {
			latitude: 21.0350,
			longitude: 106.7700
		}
	}
} as const;

export const SUPPORTED_CITIES = [
	"Hà Nội",
	"Hồ Chí Minh",
	"Đà Nẵng",
	"Hải Phòng",
	"Cần Thơ",
	"Huế",
	"Nha Trang",
	"Đà Lạt",
	"Sa Pa",
	// Các thành phố mới (không hiển thị trên trang chủ nhưng vẫn có thể tìm kiếm)
	"Phan Thiết",
	"Vinh",
	"Vũng Tàu",
	"Hạ Long",
	"Thanh Hóa",
	"Quảng Ngãi",
	"Biên Hòa",
	"Rạch Giá",
	"Quy Nhơn",
	"Bà Rịa",
	"Bạc Liêu",
	"Buôn Ma Thuột",
	"Cam Ranh",
	"Cao Bằng",
	"Cẩm Phả",
	"Điện Biên Phủ",
	"Hà Đông",
	"Đồng Xoài",
	"Đồng Hới",
	"Hà Tĩnh",
	"Hải Dương",
	"Hòa Bình",
	"Hội An",
	"Lai Châu",
	"Lạng Sơn",
	"Lào Cai",
	"Long Xuyên",
	"Mỹ Tho",
	"Ninh Bình",
	"Phan Rang - Tháp Chàm",
	"Pleiku",
	"Sa Đéc",
	"Sóc Trăng",
	"Tam Điệp",
	"Tân An",
	"Thái Bình",
	"Thái Nguyên",
	"Thủ Dầu Một",
	"Tuy Hòa",
	"Tuyên Quang",
	"Uông Bí",
];
