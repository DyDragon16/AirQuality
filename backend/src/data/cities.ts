export interface City {
	id: string;
	name: string;
	slug: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	aqi_station_id: string;
	hidden?: boolean;
}

export const CITIES: City[] = [
	{
		id: "hanoi",
		name: "Hà Nội",
		slug: "ha-noi",
		coordinates: {
			lat: 21.0285,
			lng: 105.8542,
		},
		aqi_station_id: "ZPGtcusBx9JWBKYxm",
		hidden: false,
	},
	{
		id: "hochiminh",
		name: "Hồ Chí Minh",
		slug: "ho-chi-minh",
		coordinates: {
			lat: 10.8231,
			lng: 106.6297,
		},
		aqi_station_id: "92iZQopYpL5uW7Tt7",
		hidden: false,
	},
	{
		id: "danang",
		name: "Đà Nẵng",
		slug: "da-nang",
		coordinates: {
			lat: 16.0544,
			lng: 108.2022,
		},
		aqi_station_id: "qCzTHAGRkQBNPdLDf",
		hidden: false,
	},
	{
		id: "haiphong",
		name: "Hải Phòng",
		slug: "hai-phong",
		coordinates: {
			lat: 20.8449,
			lng: 106.6881,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a892d",
		hidden: false,
	},
	{
		id: "cantho",
		name: "Cần Thơ",
		slug: "can-tho",
		coordinates: {
			lat: 10.0452,
			lng: 105.7469,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a892b",
		hidden: false,
	},
	{
		id: "hue",
		name: "Huế",
		slug: "hue",
		coordinates: {
			lat: 16.4637,
			lng: 107.5909,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88ec",
		hidden: false,
	},
	{
		id: "nhatrang",
		name: "Nha Trang",
		slug: "nha-trang",
		coordinates: {
			lat: 12.2388,
			lng: 109.1967,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8919",
		hidden: false,
	},
	{
		id: "dalat",
		name: "Đà Lạt",
		slug: "da-lat",
		coordinates: {
			lat: 11.9404,
			lng: 108.4583,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8910",
		hidden: false,
	},
	{
		id: "sapa",
		name: "Sa Pa",
		slug: "sa-pa",
		coordinates: {
			lat: 22.3364,
			lng: 103.8438,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88e7",
		hidden: false,
	},
	{
		id: "phanthiet",
		name: "Phan Thiết",
		slug: "phan-thiet",
		coordinates: {
			lat: 10.9804,
			lng: 108.2558,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8930",
		hidden: true,
	},
	{
		id: "vinh",
		name: "Vinh",
		slug: "vinh",
		coordinates: {
			lat: 18.6790,
			lng: 105.6819,
		},
		aqi_station_id: "5b7a86016a15c1ae2d8a88d7",
		hidden: true,
	},
	{
		id: "vungtau",
		name: "Vũng Tàu",
		slug: "vung-tau",
		coordinates: {
			lat: 10.3460,
			lng: 107.0843,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a893a",
		hidden: true,
	},
	{
		id: "halong",
		name: "Hạ Long",
		slug: "ha-long",
		coordinates: {
			lat: 20.9734,
			lng: 107.0299,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88fe",
		hidden: true,
	},
	{
		id: "thanhhoa",
		name: "Thanh Hóa",
		slug: "thanh-hoa",
		coordinates: {
			lat: 19.8066,
			lng: 105.7852,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88f0",
		hidden: true,
	},
	{
		id: "quangngai",
		name: "Quảng Ngãi",
		slug: "quang-ngai",
		coordinates: {
			lat: 15.1213,
			lng: 108.8061,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8901",
		hidden: true,
	},
	{
		id: "bienhoa",
		name: "Biên Hòa",
		slug: "bien-hoa",
		coordinates: {
			lat: 10.9574,
			lng: 106.8426,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8936",
		hidden: true,
	},
	{
		id: "rachgia",
		name: "Rạch Giá",
		slug: "rach-gia",
		coordinates: {
			lat: 10.0123,
			lng: 105.0921,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8915",
		hidden: true,
	},
	{
		id: "quynhon",
		name: "Quy Nhơn",
		slug: "quy-nhon",
		coordinates: {
			lat: 13.7695,
			lng: 109.2105,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a893e",
		hidden: true,
	},
	{
		id: "baria",
		name: "Bà Rịa",
		slug: "ba-ria",
		coordinates: {
			lat: 10.5014,
			lng: 107.1686,
		},
		aqi_station_id: "5bc8230f41fdcdf1939e8fec",
		hidden: true,
	},
	{
		id: "baclieu",
		name: "Bạc Liêu",
		slug: "bac-lieu",
		coordinates: {
			lat: 9.2853,
			lng: 105.7234,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8962",
		hidden: true,
	},
	{
		id: "buonmathuot",
		name: "Buôn Ma Thuột",
		slug: "buon-ma-thuot",
		coordinates: {
			lat: 12.6797,
			lng: 108.0514,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8938",
		hidden: true,
	},
	{
		id: "camranh",
		name: "Cam Ranh",
		slug: "cam-ranh",
		coordinates: {
			lat: 11.9214,
			lng: 109.1591,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a891a",
		hidden: true,
	},
	{
		id: "caobang",
		name: "Cao Bằng",
		slug: "cao-bang",
		coordinates: {
			lat: 22.6659,
			lng: 106.2518,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a893c",
		hidden: true,
	},
	{
		id: "campha",
		name: "Cẩm Phả",
		slug: "cam-pha",
		coordinates: {
			lat: 21.0167,
			lng: 107.2667,
		},
		aqi_station_id: "5bc8230e41fdcdf1939e8f66",
		hidden: true,
	},
	{
		id: "dienbienphu",
		name: "Điện Biên Phủ",
		slug: "dien-bien-phu",
		coordinates: {
			lat: 21.3856,
			lng: 103.0320,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8947",
		hidden: true,
	},
	{
		id: "hadong",
		name: "Hà Đông",
		slug: "ha-dong",
		coordinates: {
			lat: 20.9709,
			lng: 105.7791,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8929",
		hidden: true,
	},
	{
		id: "dongxoai",
		name: "Đồng Xoài",
		slug: "dong-xoai",
		coordinates: {
			lat: 11.5344,
			lng: 106.8937,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8953",
		hidden: true,
	},
	{
		id: "dongho",
		name: "Đồng Hới",
		slug: "dong-hoi",
		coordinates: {
			lat: 17.4825,
			lng: 106.6005,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8903",
		hidden: true,
	},
	{
		id: "hatinh",
		name: "Hà Tĩnh",
		slug: "ha-tinh",
		coordinates: {
			lat: 18.3560,
			lng: 105.8877,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8920",
		hidden: true,
	},
	{
		id: "haiduong",
		name: "Hải Dương",
		slug: "hai-duong",
		coordinates: {
			lat: 20.9399,
			lng: 106.3309,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8966",
		hidden: true,
	},
	{
		id: "hoabinh",
		name: "Hòa Bình",
		slug: "hoa-binh",
		coordinates: {
			lat: 20.8132,
			lng: 105.3382,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8908",
		hidden: true,
	},
	{
		id: "hoian",
		name: "Hội An",
		slug: "hoi-an",
		coordinates: {
			lat: 15.8800,
			lng: 108.3380,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8958",
		hidden: true,
	},
	{
		id: "laichau",
		name: "Lai Châu",
		slug: "lai-chau",
		coordinates: {
			lat: 22.3964,
			lng: 103.4591,
		},
		aqi_station_id: "5bc8230e41fdcdf1939e8fb1",
		hidden: true,
	},
	{
		id: "langson",
		name: "Lạng Sơn",
		slug: "lang-son",
		coordinates: {
			lat: 21.8534,
			lng: 106.7614,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a890d",
		hidden: true,
	},
	{
		id: "laocai",
		name: "Lào Cai",
		slug: "lao-cai",
		coordinates: {
			lat: 22.4856,
			lng: 103.9754,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88e8",
		hidden: true,
	},
	{
		id: "longxuyen",
		name: "Long Xuyên",
		slug: "long-xuyen",
		coordinates: {
			lat: 10.3860,
			lng: 105.4380,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8943",
		hidden: true,
	},
	{
		id: "mytho",
		name: "Mỹ Tho",
		slug: "my-tho",
		coordinates: {
			lat: 10.3602,
			lng: 106.3557,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88ea",
		hidden: true,
	},
	{
		id: "ninhbinh",
		name: "Ninh Bình",
		slug: "ninh-binh",
		coordinates: {
			lat: 20.2579,
			lng: 105.9744,
		},
		aqi_station_id: "5b7a86016a15c1ae2d8a88d9",
		hidden: true,
	},
	{
		id: "phanrangthapcham",
		name: "Phan Rang - Tháp Chàm",
		slug: "phan-rang-thap-cham",
		coordinates: {
			lat: 11.5639,
			lng: 108.9880,
		},
		aqi_station_id: "5b7a86016a15c1ae2d8a88db",
		hidden: true,
	},
	{
		id: "pleiku",
		name: "Pleiku",
		slug: "pleiku",
		coordinates: {
			lat: 13.9833,
			lng: 108.0000,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8925",
		hidden: true,
	},
	{
		id: "sadec",
		name: "Sa Đéc",
		slug: "sa-dec",
		coordinates: {
			lat: 10.2931,
			lng: 105.7548,
		},
		aqi_station_id: "5b7a86036a15c1ae2d8a8933",
		hidden: true,
	},
	{
		id: "soctrang",
		name: "Sóc Trăng",
		slug: "soc-trang",
		coordinates: {
			lat: 9.6037,
			lng: 105.9699,
		},
		aqi_station_id: "5b7a86016a15c1ae2d8a88dd",
		hidden: true,
	},
	{
		id: "tamdiep",
		name: "Tam Điệp",
		slug: "tam-diep",
		coordinates: {
			lat: 20.1567,
			lng: 105.9500,
		},
		aqi_station_id: "5bc8230e41fdcdf1939e8f89",
		hidden: true,
	},
	{
		id: "tanan",
		name: "Tân An",
		slug: "tan-an",
		coordinates: {
			lat: 10.5347,
			lng: 106.4042,
		},
		aqi_station_id: "5bc8230d41fdcdf1939e8f30",
		hidden: true,
	},
	{
		id: "thaibinh",
		name: "Thái Bình",
		slug: "thai-binh",
		coordinates: {
			lat: 20.4500,
			lng: 106.3333,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88f3",
		hidden: true,
	},
	{
		id: "thainguyen",
		name: "Thái Nguyên",
		slug: "thai-nguyen",
		coordinates: {
			lat: 21.5944,
			lng: 105.8472,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8955",
		hidden: true,
	},
	{
		id: "thudaumot",
		name: "Thủ Dầu Một",
		slug: "thu-dau-mot",
		coordinates: {
			lat: 10.9804,
			lng: 106.6519,
		},
		aqi_station_id: "5b7a86046a15c1ae2d8a8950",
		hidden: true,
	},
	{
		id: "tuyhoa",
		name: "Tuy Hòa",
		slug: "tuy-hoa",
		coordinates: {
			lat: 13.0967,
			lng: 109.3000,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a8905",
		hidden: true,
	},
	{
		id: "tuyenquang",
		name: "Tuyên Quang",
		slug: "tuyen-quang",
		coordinates: {
			lat: 21.8236,
			lng: 105.2181,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88e1",
		hidden: true,
	},
	{
		id: "uongbi",
		name: "Uông Bí",
		slug: "uong-bi",
		coordinates: {
			lat: 21.0350,
			lng: 106.7700,
		},
		aqi_station_id: "5b7a86026a15c1ae2d8a88fc",
		hidden: true,
	},
];
