import nodemailer from "nodemailer";
import { logError, logInfo } from "./logger";

// Lấy thông tin cấu hình email từ biến môi trường
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";

// Định nghĩa interface cho email options
interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
}

// Tạo transporter cho nodemailer với SMTP đơn giản
const transporter = nodemailer.createTransport({
	service: EMAIL_SERVICE,
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

// Kiểm tra kết nối email khi khởi động
const verifyEmailConnection = (): void => {
	transporter.verify((error) => {
		if (error) {
			logError("Lỗi kết nối email:", error);
		} else {
			logInfo("Kết nối email thành công, sẵn sàng gửi email");
		}
	});
};

// Hàm gửi email
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
	try {
		const mailOptions = {
			from: options.from || `Autonomys <${EMAIL_USER}>`,
			to: options.to,
			subject: options.subject,
			html: options.html,
		};

		const info = await transporter.sendMail(mailOptions);
		logInfo(`Email đã được gửi: ${info.messageId}`);
		return true;
	} catch (error) {
		logError(`Lỗi khi gửi email đến ${options.to}:`, error);
		return false;
	}
};

export { sendEmail, verifyEmailConnection, EmailOptions };
