import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Chính sách bảo vệ dữ liệu cá nhân</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-foreground mb-2">CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN</h1>
            <p className="text-muted-foreground italic">(Dành cho Khách hàng)</p>
          </div>

          <p className="text-foreground leading-relaxed">
            Chính sách bảo vệ Dữ liệu cá nhân này ("Chính sách bảo vệ DLCN") do Công ty Cổ phần Unicom
            ("Unicom") ban hành để giải thích cách Unicom thu thập, sử dụng, chia sẻ hoặc xử lý Dữ liệu cá nhân
            của các Khách hàng của Unicom thông qua các sản phẩm, dịch vụ mà Unicom cung cấp.
          </p>
          <p className="text-foreground leading-relaxed">
            Chính sách bảo vệ DLCN này mô tả mục đích và phương tiện mà Unicom xử lý Dữ liệu cá nhân với tư
            cách là Bên Kiểm soát Dữ liệu cá nhân, Bên Xử lý Dữ liệu cá nhân, Bên Kiểm soát và xử lý Dữ liệu
            cá nhân và/hoặc Bên Thứ ba có liên quan đến xử lý Dữ liệu cá nhân, tùy từng ngữ cảnh, tùy từng
            trường hợp khi Unicom xử lý Dữ liệu cá nhân. Unicom có thể chia sẻ dữ liệu cá nhân của Khách hàng
            với công ty mẹ, công ty con, công ty liên kết, chi nhánh, văn phòng đại diện của Unicom, các bên thứ
            ba khác và tiến hành các hoạt động xử lý dữ liệu với tư cách là Bên Kiểm soát Dữ liệu cá nhân hoặc
            đồng Kiểm soát Dữ liệu cá nhân hoặc Bên Xử lý Dữ liệu cá nhân cho các mục đích được nêu tại
            Chính sách bảo vệ DLCN này.
          </p>

          {/* Section 1 */}
          <Section title="1. ĐỊNH NGHĨA">
            <SubSection number="1.1" title="Chủ thể dữ liệu">
              <p>là cá nhân được Dữ liệu cá nhân phản ánh. Trong phạm vi Chính sách này,
              Chủ thể dữ liệu có thể là Khách hàng của Unicom hoặc các Chủ thể dữ liệu do Khách hàng thu
              thập, nhập lên, truyền tải, cung cấp cho Unicom trong quá trình sử dụng sản phẩm, dịch vụ của
              Unicom.</p>
              <p>Vì mục đích diễn giải và trừ khi ngữ cảnh hoặc quy định cụ thể có yêu cầu khác, thuật ngữ
              "Chủ thể dữ liệu" được hiểu bao hàm và đồng nhất với thuật ngữ "Khách hàng", và ngược lại.
              Trường hợp có sự khác biệt về phạm vi hoặc đối tượng áp dụng, nghĩa của các thuật ngữ sẽ
              được xác định theo quy định tại điều khoản tương ứng của Chính sách này.</p>
            </SubSection>
            <SubSection number="1.2" title="Khách hàng">
              <p>là bên tiếp cận, tìm hiểu, đăng ký, sử dụng hoặc có liên quan trong quá trình hoạt
              động, cung cấp các sản phẩm, dịch vụ của Unicom. Tại Chính sách bảo vệ DLCN này, Khách
              hàng có thể là Chủ thể dữ liệu hoặc là bên cung cấp, chia sẻ Dữ liệu cá nhân của Chủ thể dữ
              liệu cho Unicom.</p>
            </SubSection>
            <SubSection number="1.3" title="Dữ liệu cá nhân">
              <p>là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc
              dạng tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định
              một con người cụ thể. Dữ liệu cá nhân bao gồm Dữ liệu cá nhân cơ bản và Dữ liệu cá nhân
              nhạy cảm.</p>
            </SubSection>
            <SubSection number="1.4" title="Dữ liệu cá nhân cơ bản">
              <p>là một trong các loại dữ liệu sau:</p>
              <ul className="list-disc pl-6 space-y-1 text-foreground">
                <li>Họ, chữ đệm và tên khai sinh, tên gọi khác (nếu có);</li>
                <li>Ngày, tháng, năm sinh; ngày, tháng, năm chết hoặc mất tích;</li>
                <li>Giới tính;</li>
                <li>Nơi sinh, nơi đăng ký khai sinh, nơi thường trú, nơi tạm trú, nơi ở hiện tại, quê quán, địa chỉ liên hệ;</li>
                <li>Quốc tịch;</li>
                <li>Hình ảnh của cá nhân;</li>
                <li>Số điện thoại, số chứng minh nhân dân, số định danh cá nhân, số hộ chiếu, số giấy phép lái xe, số biển số xe, số mã số thuế cá nhân, số bảo hiểm xã hội, số thẻ bảo hiểm y tế;</li>
                <li>Tình trạng hôn nhân;</li>
                <li>Thông tin về mối quan hệ gia đình (cha mẹ, con cái);</li>
                <li>Thông tin về tài khoản số của cá nhân; dữ liệu cá nhân phản ánh hoạt động, lịch sử hoạt động trên không gian mạng;</li>
                <li>Các thông tin khác gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể được hiểu theo quy định pháp luật về bảo vệ dữ liệu cá nhân có hiệu lực từng thời điểm.</li>
              </ul>
            </SubSection>
            <SubSection number="1.5" title="Dữ liệu cá nhân nhạy cảm">
              <p>là dữ liệu cá nhân gắn liền với quyền riêng tư của cá nhân mà khi bị xâm phạm sẽ gây ảnh hưởng trực tiếp tới quyền và lợi ích hợp pháp của cá nhân gồm:</p>
              <ul className="list-disc pl-6 space-y-1 text-foreground">
                <li>Quan điểm chính trị, quan điểm tôn giáo;</li>
                <li>Tình trạng sức khỏe và đời tư được ghi trong hồ sơ bệnh án, không bao gồm thông tin về nhóm máu;</li>
                <li>Thông tin liên quan đến nguồn gốc chủng tộc, nguồn gốc dân tộc;</li>
                <li>Thông tin về đặc điểm di truyền được thừa hưởng hoặc có được của cá nhân;</li>
                <li>Thông tin về thuộc tính vật lý, đặc điểm sinh học riêng của cá nhân;</li>
                <li>Thông tin về đời sống tình dục, xu hướng tình dục của cá nhân;</li>
                <li>Dữ liệu về tội phạm, hành vi phạm tội được thu thập, lưu trữ bởi các cơ quan thực thi pháp luật;</li>
                <li>Thông tin khách hàng của tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, tổ chức cung ứng dịch vụ trung gian thanh toán, các tổ chức được phép khác, gồm: thông tin định danh khách hàng theo quy định của pháp luật, thông tin về tài khoản, thông tin về tiền gửi, thông tin về tài sản gửi, thông tin về giao dịch, thông tin về tổ chức, cá nhân là bên bảo đảm tại tổ chức tín dụng, chi nhánh ngân hàng, tổ chức cung ứng dịch vụ trung gian thanh toán;</li>
                <li>Dữ liệu về vị trí của cá nhân được xác định qua dịch vụ định vị;</li>
                <li>Dữ liệu cá nhân khác được pháp luật quy định là đặc thù và cần có biện pháp bảo mật cần thiết.</li>
              </ul>
            </SubSection>
            <SubSection number="1.6" title="Xử lý Dữ liệu cá nhân">
              <p>là một hoặc nhiều hoạt động tác động tới Dữ liệu cá nhân, như: thu
              thập, ghi, phân tích, xác nhận, lưu trữ, chỉnh sửa, công khai, kết hợp, truy cập, truy xuất, thu
              hồi, mã hóa, giải mã, sao chép, chia sẻ, truyền đưa, cung cấp, chuyển giao, xóa, hủy Dữ liệu cá
              nhân hoặc các hành động khác có liên quan.</p>
            </SubSection>
            <SubSection number="1.7" title="Bên Kiểm soát Dữ liệu cá nhân">
              <p>là tổ chức, cá nhân quyết định mục đích và phương tiện xử lý Dữ liệu cá nhân.</p>
            </SubSection>
            <SubSection number="1.8" title="Bên Xử lý Dữ liệu cá nhân">
              <p>là tổ chức, cá nhân thực hiện việc xử lý dữ liệu thay mặt cho Bên
              Kiểm soát dữ liệu, thông qua một hợp đồng hoặc thỏa thuận với Bên Kiểm soát dữ liệu.</p>
            </SubSection>
            <SubSection number="1.9" title="Bên Kiểm soát và xử lý Dữ liệu cá nhân">
              <p>là tổ chức, cá nhân đồng thời quyết định mục đích, phương tiện và trực tiếp xử lý dữ liệu cá nhân.</p>
            </SubSection>
          </Section>

          {/* Section 2 */}
          <Section title="2. TUYÊN BỐ CỦA KHÁCH HÀNG">
            <SubSection number="2.1">
              <p>Khách hàng xác nhận đã đọc, tìm hiểu và nắm được đầy đủ các quyền, nghĩa vụ của mình với
              tư cách là Chủ thể dữ liệu, loại Dữ liệu cá nhân được xử lý, mục đích xử lý và các tổ chức, cá
              nhân được Xử lý Dữ liệu cá nhân. Chính sách bảo vệ DLCN này có giá trị tương đương với
              một thông báo của Unicom cho Khách hàng trước khi Unicom tiến hành Xử lý Dữ liệu cá nhân.</p>
            </SubSection>
            <SubSection number="2.2">
              <p>Khách hàng hiểu rõ rằng việc cung cấp Dữ liệu cá nhân đồng nghĩa với việc Khách hàng đã
              thể hiện sự đồng ý rõ ràng, tự nguyện và có căn cứ pháp lý cho Unicom thu thập, sử dụng và xử
              lý Dữ liệu cá nhân của mình theo các điều khoản và mục đích hợp pháp theo quy định tại Điều
              4 Chính sách này.</p>
            </SubSection>
            <SubSection number="2.3">
              <p>Bằng việc cung cấp Dữ liệu cá nhân của một bên thứ ba là Chủ thể dữ liệu (bao gồm nhưng
              không giới hạn người đại diện pháp luật, nhân sự, người phụ thuộc, người có liên quan theo
              quy định pháp luật, bạn bè, người tham chiếu, bên thụ hưởng, người được ủy quyền, đối tác
              của Khách hàng) cho Unicom, Khách hàng cam đoan đã có được sự đồng ý của Chủ thể dữ liệu
              cho việc Xử lý Dữ liệu cá nhân theo Chính sách bảo vệ DLCN này, đồng thời xác nhận đã
              thông báo và được sự đồng ý của Chủ thể dữ liệu về việc tuân thủ Chính sách bảo vệ DLCN này.</p>
            </SubSection>
            <SubSection number="2.4">
              <p>Khách hàng hiểu và đồng ý rằng Unicom có thể chủ động xử lý Dữ liệu cá nhân của các Chủ thể
              dữ liệu do Khách hàng nhập, đăng tải, liên kết, chia sẻ trên các tính năng, công cụ sẵn có khi
              sử dụng phần mềm của Unicom với vai trò là Bên kiểm soát Dữ liệu cá nhân để cung cấp sản
              phẩm, dịch vụ cho từng Chủ thể dữ liệu riêng lẻ phù hợp với quy định pháp luật.</p>
            </SubSection>
          </Section>

          {/* Section 3 */}
          <Section title="3. LOẠI DỮ LIỆU CÁ NHÂN XỬ LÝ">
            <p className="text-foreground">Dữ liệu cá nhân được xử lý gồm các dữ liệu Khách hàng cung cấp cho Unicom, cụ thể như sau:</p>
            <SubSection number="3.1">
              <p>Các Dữ liệu cá nhân cơ bản quy định tại Điều 1.4 của Chính sách này; và</p>
            </SubSection>
            <SubSection number="3.2">
              <p>Các Dữ liệu cá nhân nhạy cảm quy định Điều 1.5 của Chính sách này.</p>
            </SubSection>
          </Section>

          {/* Section 4 */}
          <Section title="4. MỤC ĐÍCH XỬ LÝ DỮ LIỆU CÁ NHÂN">
            <p className="text-foreground">Khách hàng đồng ý rằng Dữ liệu cá nhân theo Điều 3 trên đây có thể được xử lý cho các mục đích sau:</p>
            
            <SubSection number="4.1" title="Triển khai, cung ứng sản phẩm, dịch vụ cho Khách hàng:">
              <ol className="list-[lower-alpha] pl-6 space-y-2 text-foreground">
                <li>Liên hệ xác nhận, tư vấn, giải đáp thắc mắc, kết nối sử dụng sản phẩm, dịch vụ của Unicom.</li>
                <li>Thực hiện các thủ tục cần thiết cho việc giao kết hợp đồng, quản lý việc thực hiện các quyền và nghĩa vụ theo hợp đồng và xác lập bất cứ giao dịch nào phát sinh từ/hoặc có liên quan tới hợp đồng giữa Unicom với Khách hàng.</li>
                <li>Tạo lập, định danh và quản lý tài khoản người dùng.</li>
                <li>Cấp và quản lý quyền truy cập, sử dụng các tính năng của phần mềm.</li>
                <li>Phát hành, xử lý, lưu trữ và truyền nhận hóa đơn điện tử, chứng từ điện tử, các chứng từ, tài liệu khác theo tính năng của phần mềm.</li>
                <li>Kết nối, tích hợp và đồng bộ hóa dữ liệu giữa các phần mềm khác nhau của Unicom hoặc tới các hệ thống khác của bên thứ ba một cách hợp pháp theo quy định tại Chính sách này nhằm gia tăng tiện ích các sản phẩm, dịch vụ cung cấp cho Khách hàng.</li>
                <li>Quản lý việc đăng ký, gia hạn, nâng cấp các gói thuê bao phần mềm.</li>
                <li>Cải thiện, nâng cấp chất lượng sản phẩm, dịch vụ mà Unicom cung cấp cho Khách hàng.</li>
              </ol>
            </SubSection>

            <SubSection number="4.2" title="Hỗ trợ, chăm sóc và quản lý trải nghiệm Khách hàng">
              <ol className="list-[lower-alpha] pl-6 space-y-2 text-foreground">
                <li>Cung cấp các dịch vụ hỗ trợ kỹ thuật, hướng dẫn sử dụng và giải đáp các thắc mắc trong quá trình Khách hàng sử dụng sản phẩm, dịch vụ.</li>
                <li>Thu thập ý kiến đóng góp, thực hiện khảo sát để đo lường sự hài lòng và cải tiến trải nghiệm người dùng.</li>
                <li>Gửi các thông báo quan trọng liên quan đến quản trị tài khoản, lịch bảo trì hệ thống, các bản cập nhật và cảnh báo bảo mật.</li>
              </ol>
            </SubSection>

            <SubSection number="4.3" title="An ninh, tuân thủ và quản trị rủi ro">
              <ol className="list-[lower-alpha] pl-6 space-y-2 text-foreground">
                <li>Thực hiện các hoạt động tuân thủ quy định pháp luật và/hoặc các yêu cầu hợp pháp từ các cơ quan nhà nước có thẩm quyền.</li>
                <li>Điều tra, giải quyết các tranh chấp, khiếu nại, tố cáo của Khách hàng hoặc liên quan tới Khách hàng phù hợp với quy định pháp luật.</li>
                <li>Thực hiện các biện pháp nhằm đảm bảo an toàn, bảo mật, bảo vệ Dữ liệu cá nhân của Chủ thể dữ liệu trước các trường hợp gây hại, nguy cơ gây hại; phục vụ công tác lưu trữ, quản lý, bảo vệ, an toàn thông tin.</li>
              </ol>
            </SubSection>

            <SubSection number="4.4" title="Truyền thông, tiếp thị và phát triển kinh doanh">
              <p>Cập nhật, gửi các tin quảng cáo, thông tin về các sự kiện liên quan đến sản phẩm, dịch vụ của
              Unicom và các dịch vụ khác do đối tác của Unicom cung cấp.</p>
            </SubSection>
          </Section>

          {/* Section 5 */}
          <Section title="5. CÁCH THỨC XỬ LÝ DỮ LIỆU">
            <SubSection number="5.1" title="Cách thức thu thập">
              <p>Unicom thu thập Dữ liệu cá nhân của Khách hàng dữ liệu qua nhiều kênh khác nhau, bao gồm:</p>
              <ol className="list-[lower-alpha] pl-6 space-y-2 text-foreground">
                <li>Thông qua liên hệ trực tiếp (bằng lời nói hoặc/và bằng văn bản) giữa Khách hàng với Unicom tại các sự kiện, buổi họp báo, chương trình xúc tiến thương mại, quảng bá, thăm quan văn phòng trụ sở.</li>
                <li>Thông qua các văn bản khảo sát, truyền thông mạng xã hội;</li>
                <li>Từ các bên thứ ba khác có quan hệ hoặc liên quan đến Khách hàng thông qua các thoả thuận hợp tác, hợp đồng ký kết với các bên này và dựa trên các căn cứ, cam kết về việc các bên này đã được Khách hàng chấp thuận về việc cung cấp dữ liệu cá nhân;</li>
                <li>Thông qua các tập tin được tạo ra bởi trang web của Unicom mà Khách hàng truy cập (cookie);</li>
                <li>Thông qua các hợp đồng/thỏa thuận ký giữa Unicom và Khách hàng;</li>
                <li>Thông qua các đoạn phim lưu trữ từ máy quay giám sát (CCTV), thiết bị ghi âm, ghi hình tại các trụ sở, văn phòng, trung tâm dữ liệu của Unicom.</li>
              </ol>
            </SubSection>

            <SubSection number="5.2" title="Cách thức lưu trữ">
              <p>Dữ liệu cá nhân của Khách hàng tại Unicom được lưu trữ tại hệ thống cơ sở dữ liệu bảo mật, có biện
              pháp kỹ thuật phù hợp để ngăn chặn truy cập trái phép, mất mát, thay đổi hoặc rò rỉ dữ liệu hoặc tại
              bất cứ đâu mà Unicom có cơ sở và tạo bản sao lưu trữ tại trung tâm dữ liệu ở một khu vực khác
              và/hoặc trong quá trình Khách hàng truy cập website, ứng dụng, dịch vụ nội bộ của Unicom, qua
              cookie, clickstream hoặc các công cụ lưu trữ dữ liệu duyệt website tương tự.</p>
            </SubSection>

            <SubSection number="5.3" title="Cách thức mã hóa">
              <p>Unicom thực hiện mã hóa Dữ liệu cá nhân thu thập được theo các tiêu chuẩn mã hóa phù hợp trong
              quá trình lưu trữ hoặc chuyển giao dữ liệu, để đảm bảo tính bảo mật, xác thực, toàn vẹn và ngăn
              chặn việc truy cập, thay đổi trái phép đối với Dữ liệu cá nhân kể từ khi thu thập cho đến khi kết thúc
              quá trình xử lý.</p>
            </SubSection>

            <SubSection number="5.4" title="Cách thức xóa, hủy dữ liệu">
              <p>Unicom thực hiện xóa, hủy Dữ liệu cá nhân của Khách hàng trong các trường hợp sau:</p>
              <ol className="list-[lower-alpha] pl-6 space-y-2 text-foreground">
                <li>Khách hàng có yêu cầu xóa, hủy Dữ liệu cá nhân.</li>
                <li>Khách hàng rút lại sự đồng ý xử lý Dữ liệu cá nhân.</li>
                <li>Mục đích xử lý Dữ liệu cá nhân đã hoàn thành hoặc không còn phù hợp, hoặc theo các trường hợp khác được pháp luật quy định.</li>
              </ol>
              <p className="mt-2">Trường hợp pháp luật yêu cầu Unicom phải lưu giữ dữ liệu, hoặc vì lý do hợp pháp khác nhằm bảo vệ
              lợi ích hợp pháp của Unicom, Khách hàng đồng ý và thừa nhận rằng Unicom được quyền tiếp tục lưu
              giữ và xử lý dữ liệu trong phạm vi đó mà không phải thực hiện xóa, hủy.</p>
            </SubSection>

            <SubSection number="5.5" title="Cách thức phân tích">
              <p>Trong một số trường hợp, Dữ liệu cá nhân có thể được ẩn danh hóa, tổng hợp hóa hoặc khử nhận
              dạng trước khi được phân tích, nghiên cứu nhằm đảm bảo quyền riêng tư của Chủ thể dữ liệu cho
              mục đích Xử lý Dữ liệu cá nhân đã được Khách hàng chấp thuận tại Chính sách này.</p>
            </SubSection>
          </Section>

          {/* Section 6 */}
          <Section title="6. HẬU QUẢ, THIỆT HẠI KHÔNG MONG MUỐN CÓ KHẢ NĂNG XẢY RA">
            <SubSection number="6.1">
              <p>Unicom cam kết áp dụng các biện pháp kỹ thuật, vật lý và quản lý phù hợp để bảo vệ và đảm
              bảo tính bảo mật Dữ liệu cá nhân của Khách hàng.</p>
            </SubSection>
            <SubSection number="6.2">
              <p>Tuy nhiên, do các yếu tố đặc thù của công nghệ lập trình phần mềm và rủi ro trên không gian
              mạng, Khách hàng cần biết rõ rằng bất kỳ thời điểm nào Khách hàng tiết lộ và công khai Dữ
              liệu cá nhân của mình, rủi ro về lộ lọt Dữ liệu cá nhân có thể xảy ra nằm ngoài tầm kiểm soát
              của Khách hàng và Unicom. Do vậy, Unicom không thể cam kết bảo vệ một cách tuyệt đối Dữ
              liệu cá nhân của Khách hàng và không chịu trách nhiệm trong các trường hợp sau:</p>
              <ol className="list-[lower-roman] pl-6 space-y-1 text-foreground">
                <li>Lỗi phần cứng, phần mềm trong quá trình xử lý dữ liệu làm mất dữ liệu Khách hàng;</li>
                <li>Lỗ hổng bảo mật nằm ngoài khả năng kiểm soát của Unicom, hệ thống bị hacker tấn công gây lộ, lọt dữ liệu.</li>
              </ol>
            </SubSection>
            <SubSection number="6.3">
              <p>Trong trường hợp máy chủ lưu trữ dữ liệu bị tấn công dẫn đến bị mất, lộ, lọt Dữ liệu cá nhân
              của Khách hàng, Unicom sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra
              xử lý kịp thời và thông báo cho Khách hàng được biết theo quy định pháp luật.</p>
            </SubSection>
          </Section>

          {/* Section 7 */}
          <Section title="7. THỜI GIAN BẮT ĐẦU, THỜI GIAN KẾT THÚC XỬ LÝ DỮ LIỆU CÁ NHÂN">
            <SubSection number="7.1" title="Thời điểm bắt đầu">
              <p>Dữ liệu cá nhân được xử lý kể từ thời điểm Unicom nhận được Dữ liệu cá nhân của Khách hàng
              và Unicom đã có cơ sở pháp lý phù hợp để xử lý dữ liệu theo quy định pháp luật.</p>
            </SubSection>
            <SubSection number="7.2" title="Thời điểm kết thúc">
              <p>Dữ liệu cá nhân sẽ được Unicom dừng xử lý khi (tùy theo sự kiện nào đến sau):</p>
              <ol className="list-[lower-roman] pl-6 space-y-1 text-foreground">
                <li>Theo yêu cầu bằng văn bản của Chủ thể dữ liệu phù hợp với Chính sách bảo vệ DLCN này;</li>
                <li>Kết thúc mục đích xử lý Dữ liệu cá nhân theo Chính sách bảo vệ DLCN này;</li>
                <li>Theo quy định của pháp luật.</li>
              </ol>
            </SubSection>
            <SubSection number="7.3">
              <p>Unicom có thể sẽ lưu trữ Dữ liệu cá nhân của Khách hàng ngay cả trong quá trình cung cấp sản
              phẩm, dịch vụ hoặc khi đã chấm dứt hợp đồng/thỏa thuận với Khách hàng để thực hiện các
              nghĩa vụ pháp lý của Unicom theo quy định pháp luật và/hoặc theo yêu cầu của cơ quan Nhà
              nước có thẩm quyền.</p>
            </SubSection>
          </Section>

          {/* Section 8 */}
          <Section title="8. TỔ CHỨC, CÁ NHÂN THAM GIA QUÁ TRÌNH XỬ LÝ DỮ LIỆU CÁ NHÂN">
            <SubSection number="8.1">
              <p>Tùy từng trường hợp, Khách hàng hiểu rằng Unicom có thể là Bên Kiểm soát Dữ liệu cá nhân/
              Bên Kiểm soát và xử lý Dữ liệu cá nhân hoặc Bên xử lý dữ liệu cá nhân.</p>
            </SubSection>
            <SubSection number="8.2">
              <p>Trong phạm vi pháp luật cho phép, Khách hàng hiểu rõ rằng Unicom có thể chia sẻ Dữ liệu cá
              nhân nhằm các mục đích hợp pháp được đề cập tại Điều 3 với các tổ chức, cá nhân dưới đây:</p>
              <ol className="list-[lower-roman] pl-6 space-y-2 text-foreground">
                <li>Các công ty con, doanh nghiệp thành viên, công ty liên kết của Unicom;</li>
                <li>Tổ chức, cá nhân cung cấp, sử dụng sản phẩm, dịch vụ và/hoặc hợp tác với Unicom, bao gồm nhưng không giới hạn: các đơn vị tư vấn, kiểm toán, luật sư, công chứng viên và các đối tác hợp tác kinh doanh, cung cấp sản phẩm, dịch vụ tiện ích nói chung; cung cấp giải pháp công nghệ thông tin, phần mềm, ứng dụng; dịch vụ thanh toán; các dịch vụ vận hành, quản trị nhân sự;</li>
                <li>Bất kỳ cá nhân, tổ chức nào là bên đại diện, bên được ủy quyền của Chủ thể dữ liệu/Khách hàng, hành động thay mặt Chủ thể dữ liệu/Khách hàng;</li>
                <li>Cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</li>
              </ol>
              <p className="mt-2">Việc chia sẻ dữ liệu sẽ được thực hiện theo đúng trình tự, cách thức và quy định pháp luật hiện
              hành. Các bên tiếp nhận Dữ liệu cá nhân có nghĩa vụ bảo mật Dữ liệu cá nhân của Khách hàng
              phù hợp với Chính sách này; các quy định, quy trình, tiêu chuẩn về Bảo vệ Dữ liệu cá nhân
              của Unicom và quy định pháp luật hiện hành.</p>
            </SubSection>
          </Section>

          {/* Section 9 */}
          <Section title="9. QUYỀN CỦA CHỦ THỂ DỮ LIỆU">
            <p className="text-foreground">Chủ thể dữ liệu có các quyền hợp pháp theo quy định pháp luật, bao gồm:</p>
            
            <SubSection number="9.1" title="Quyền được biết:">
              <p>Chủ thể dữ liệu có quyền được biết về hoạt động xử lý Dữ liệu cá nhân của mình với các nội
              dung như sau: Loại dữ liệu cá nhân được xử lý, mục đích xử lý, các bên tham gia vào hoạt
              động xử lý (bao gồm cả cá nhân và tổ chức), các quyền, nghĩa vụ của Chủ thể dữ liệu.</p>
            </SubSection>

            <SubSection number="9.2" title="Quyền đồng ý, rút lại sự đồng ý, hạn chế và phản đối xử lý dữ liệu cá nhân">
              <p>Chủ thể dữ liệu có quyền đồng ý hoặc không đồng ý cho phép xử lý Dữ liệu cá nhân; có thể
              đồng ý một phần hoặc với điều kiện kèm theo. Trong nhiều trường hợp, Unicom chỉ có thể bắt
              đầu xử lý Dữ liệu cá nhân khi Chủ thể dữ liệu đồng ý toàn bộ mà không có điều kiện kèm theo.</p>
              <p>Chủ thể dữ liệu cũng có thể rút lại sự đồng ý cho phép xử lý dữ liệu cá nhân, yêu cầu hạn chế,
              phản đối việc xử lý Dữ liệu cá nhân mà Unicom đang lưu giữ hoặc kiểm soát. Việc rút lại sự
              đồng ý không ảnh hưởng tới tính hợp pháp của việc xử lý dữ liệu đã được đồng ý trước khi rút
              lại sự đồng ý.</p>
              <p>Trường hợp việc rút lại sự đồng ý, yêu cầu hạn chế, phản đối việc xử lý Dữ liệu cá nhân không
              thực hiện được do yếu tố kỹ thuật hoặc khả năng đáp ứng của cơ sở hạ tầng, Unicom được miễn
              trừ mọi nghĩa vụ và trách nhiệm liên quan đến yêu cầu rút lại sự đồng ý này của Chủ thể dữ liệu.</p>
            </SubSection>

            <SubSection number="9.3" title="Quyền truy cập và yêu cầu chỉnh sửa Dữ liệu cá nhân">
              <p>Chủ thể dữ liệu được truy cập để xem, chỉnh sửa hoặc yêu cầu Unicom chỉnh sửa Dữ liệu cá
              nhân của mình, trừ trường hợp luật có quy định khác. Unicom sẽ nỗ lực tiến hành ngay các biện
              pháp cần thiết để xử lý các yêu cầu chỉnh sửa dữ liệu phù hợp với quy định của pháp luật áp dụng.</p>
              <p>Trường hợp việc xem, chỉnh sửa, xóa Dữ liệu cá nhân không thực hiện được do yếu tố kỹ thuật
              hoặc khả năng đáp ứng của cơ sở hạ tầng, Unicom được miễn trừ mọi nghĩa vụ và trách nhiệm
              liên quan đến yêu cầu xem, chỉnh sửa, xóa Dữ liệu cá nhân này của Chủ thể dữ liệu.</p>
            </SubSection>

            <SubSection number="9.4" title="Quyền yêu cầu cung cấp dữ liệu">
              <p>Chủ thể dữ liệu có quyền yêu cầu bằng văn bản về việc cung cấp dữ liệu cá nhân mà Unicom thu
              thập, xử lý. Yêu cầu này được coi là hợp lệ và được chấp nhận xử lý khi có đầy đủ các thông
              tin cần thiết và sử dụng đúng biểu mẫu theo quy định của Unicom tại từng thời điểm, hoặc theo
              quy định của pháp luật áp dụng.</p>
              <p>Chủ thể dữ liệu cũng có quyền yêu cầu Unicom cung cấp Dữ liệu cá nhân của mình cho các tổ
              chức, cá nhân khác với điều kiện Chủ thể dữ liệu phải cung cấp được văn bản đồng ý bên nhận dữ liệu.</p>
            </SubSection>

            <SubSection number="9.5" title="Quyền yêu cầu xóa dữ liệu">
              <p>Unicom sẽ hủy hoặc xóa Dữ liệu cá nhân của Chủ thể dữ liệu khi nhận được yêu cầu hợp lệ của
              Chủ thể dữ liệu trong các trường hợp (i) Chủ thể dữ liệu nhận thấy Dữ liệu cá nhân không còn
              phục vụ mục đích đã đồng ý và Chủ thể dữ liệu chấp nhận các thiệt hại có thể xảy ra khi yêu
              cầu xóa dữ liệu; (ii) Chủ thể dữ liệu rút lại sự đồng ý; (iii) Chủ thể dữ liệu phản đối hoạt động
              xử lý Dữ liệu cá nhân và Unicom không có lý do chính đáng để tiếp tục xử lý; (iv) Dữ liệu cá
              nhân của Chủ thể dữ liệu được xử lý không đúng với mục đích đã đồng ý hoặc việc xử lý dữ
              liệu cá nhân là vi phạm quy định của pháp luật áp dụng; (v) dữ liệu cá nhân phải xóa theo quy
              định của pháp luật áp dụng.</p>
            </SubSection>

            <SubSection number="9.6" title="Thực hiện quyền của Chủ thể dữ liệu">
              <p>Đối với những Dữ liệu cá nhân do Unicom thu thập và xử lý với vai trò là Bên Kiểm soát Dữ
              liệu cá nhân, Chủ thể dữ liệu có thể yêu cầu Unicom thực hiện các quyền hợp pháp của mình
              thông qua các tính năng, tuỳ chọn sẵn có được cung cấp trên phần mềm hoặc gửi yêu cầu trực
              tiếp bằng văn bản tới Unicom hoặc liên hệ Unicom qua email: <span className="text-primary font-medium">dpo@unicom.com.vn</span>.</p>
              <p>Khách hàng của Unicom, với vai trò là Bên Kiểm soát Dữ liệu cá nhân đối với các Chủ thể dữ
              liệu do Khách hàng nhập lên, đăng tải, thu thập, đồng bộ, kết nối lên trên các tính năng, công
              cụ sẵn có của phần mềm Unicom, có nghĩa vụ đảm bảo việc thực thi các quyền của Chủ thể dữ
              liệu và chịu trách nhiệm theo quy định pháp luật về việc đảm bảo thực thi quyền nêu trên.</p>
              <p>Theo đó, để thực thi các quyền của mình theo đúng quy định pháp luật, Chủ thể dữ liệu vui
              lòng liên hệ với Khách hàng của Unicom tương ứng để được hỗ trợ xử lý. Mọi yêu cầu, phản hồi
              của Chủ thể dữ liệu trong trường hợp này, nếu được gửi trực tiếp tới Unicom, sẽ được Unicom
              chuyển lại cho Khách hàng của Unicom đang quản lý hệ thống phần mềm liên quan đến Dữ liệu
              cá nhân của Chủ thể dữ liệu tương ứng.</p>
              <p>Ngay khi nhận được yêu cầu hợp pháp từ phía Chủ thể dữ liệu cá nhân, Unicom sẽ thực hiện yêu
              cầu của Chủ thể dữ liệu trong khả năng và thời hạn hợp lý theo quy định pháp luật kể từ ngày
              nhận được yêu cầu và thông báo cho Chủ thể dữ liệu về kết quả thực hiện sau khi xử lý yêu cầu.</p>
            </SubSection>
          </Section>

          {/* Section 10 */}
          <Section title="10. NGHĨA VỤ CỦA CHỦ THỂ DỮ LIỆU">
            <SubSection number="10.1">
              <p>Tuân thủ các quy định pháp luật, quy định của Unicom liên quan đến Xử lý Dữ liệu cá nhân của Chủ thể dữ liệu.</p>
            </SubSection>
            <SubSection number="10.2">
              <p>Cung cấp, cập nhật đầy đủ, trung thực, chính xác Dữ liệu cá nhân, các thông tin khác khi sử
              dụng phần mềm Unicom. Unicom tiến hành bảo mật Dữ liệu cá nhân căn cứ trên thông tin Khách
              hàng đã cung cấp. Do đó, nếu có bất kỳ thông tin sai lệch nào, Unicom sẽ không chịu trách
              nhiệm trong trường hợp thông tin đó làm ảnh hưởng hoặc hạn chế quyền lợi của hoặc gây ra
              thiệt hại cho Chủ thể dữ liệu. Trường hợp không thông báo, nếu có phát sinh rủi ro, tổn thất thì
              Khách hàng chịu trách nhiệm về những sai sót do không cung cấp, cập nhật đúng, đầy đủ,
              chính xác, kịp thời sự thay đổi thông tin, bao gồm cả thiệt hại về tài chính, chi phí phát sinh do
              thông tin cung cấp sai hoặc không thống nhất.</p>
            </SubSection>
            <SubSection number="10.3">
              <p>Phối hợp với Unicom, cơ quan nhà nước có thẩm quyền hoặc bên thứ ba trong trường hợp phát sinh các vấn đề ảnh hưởng đến tính bảo mật Dữ liệu cá nhân của Chủ thể dữ liệu.</p>
            </SubSection>
            <SubSection number="10.4">
              <p>Tự bảo vệ Dữ liệu cá nhân của mình; yêu cầu các tổ chức, cá nhân khác có liên quan bảo vệ
              Dữ liệu cá nhân của mình; chủ động áp dụng các biện pháp nhằm bảo vệ Dữ liệu cá nhân của
              mình trong quá trình làm việc, thực hiện nhiệm vụ; thông báo kịp thời cho Unicom khi phát hiện
              thấy có sai sót, nhầm lẫn về Dữ liệu cá nhân hoặc nghi ngờ Dữ liệu cá nhân đang bị xâm phạm.</p>
            </SubSection>
            <SubSection number="10.5">
              <p>Tôn trọng, bảo vệ Dữ liệu cá nhân của Chủ thể dữ liệu khác.</p>
            </SubSection>
            <SubSection number="10.6">
              <p>Tự chịu trách nhiệm đối với những thông tin, dữ liệu mà Khách hàng tạo lập, cung cấp trên
              không gian mạng; tự chịu trách nhiệm trong trường hợp Dữ liệu cá nhân bị rò rỉ, xâm phạm do lỗi của mình.</p>
            </SubSection>
            <SubSection number="10.7">
              <p>Thường xuyên cập nhật các quy định, chính sách liên quan đến việc bảo vệ và Xử lý Dữ liệu cá nhân của Unicom trong từng thời kỳ.</p>
            </SubSection>
            <SubSection number="10.8">
              <p>Thực hiện quy định pháp luật về bảo vệ Dữ liệu cá nhân và tham gia phòng, chống các hành vi vi phạm quy định về bảo vệ Dữ liệu cá nhân.</p>
            </SubSection>
            <SubSection number="10.9">
              <p>Các trách nhiệm khác theo quy định pháp luật.</p>
            </SubSection>
          </Section>

          {/* Section 11 */}
          <Section title="11. DỮ LIỆU CÁ NHÂN CỦA TRẺ EM">
            <SubSection number="11.1">
              <p>Unicom xử lý dữ liệu cá nhân của trẻ em trên nguyên tắc tôn trọng, bảo vệ quyền và vì lợi ích tốt
              nhất của trẻ em, đồng thời tuân thủ đầy đủ các quy định của pháp luật hiện hành.</p>
            </SubSection>
            <SubSection number="11.2">
              <p>Đối với việc cung cấp các sản phẩm, dịch vụ phần mềm, Unicom hoạt động với vai trò là Bên cung cấp phần mềm cho
              Khách hàng. Theo đó, Khách hàng (ví dụ: nhà trường, cơ sở giáo dục, hoặc cha, mẹ, người
              giám hộ) là Bên Kiểm soát Dữ liệu cá nhân và có toàn quyền quyết định mục đích, phương
              tiện xử lý dữ liệu cá nhân của trẻ em.</p>
            </SubSection>
            <SubSection number="11.3">
              <p>Bên Kiểm soát Dữ liệu cá nhân chịu trách nhiệm toàn bộ trong việc: (i) thực hiện thủ tục lấy sự
              đồng ý hợp lệ của cha, mẹ hoặc người giám hộ và của trẻ em (đối với trẻ từ đủ 07 tuổi trở lên);
              và (ii) xác minh độ tuổi của trẻ em trước khi cung cấp hoặc nhập dữ liệu vào các sản phẩm,
              dịch vụ của Unicom.</p>
            </SubSection>
            <SubSection number="11.4">
              <p>Unicom sẽ chỉ xử lý dữ liệu cá nhân của trẻ em theo thỏa thuận và chỉ thị hợp pháp từ Bên Kiểm
              soát Dữ liệu cá nhân. Cha, mẹ hoặc người giám hộ có các quyền đối với Dữ liệu cá nhân của trẻ. Để thực hiện các quyền này (như truy cập, chỉnh sửa, yêu cầu ngừng xử lý hoặc xóa dữ liệu), cần lưu ý:</p>
              <ol className="list-[lower-roman] pl-6 space-y-1 text-foreground">
                <li>Đối với dữ liệu do mình trực tiếp cung cấp và quản lý, cha, mẹ hoặc người giám hộ có thể thực hiện thông qua các tính năng có sẵn của phần mềm.</li>
                <li>Đối với dữ liệu do một bên thứ ba (như nhà trường) quản lý, cha, mẹ hoặc người giám hộ cần liên hệ trực tiếp với nhà trường để yêu cầu thực hiện quyền của mình.</li>
              </ol>
            </SubSection>
          </Section>

          {/* Section 12 */}
          <Section title="12. SỬ DỤNG COOKIES">
            <SubSection number="12.1">
              <p>Unicom có thể sử dụng "Cookies" hoặc các công nghệ tương tự khác nhằm mục đích thu thập
              hoặc chia sẻ thông tin để cải thiện website, sản phẩm hiện có và/hoặc phát triển các dịch vụ,
              tính năng mới. "Cookies" là các tệp dữ liệu nhỏ mà chúng tôi gửi tới máy tính hoặc thiết bị di
              động của Chủ thể dữ liệu/Khách hàng. Các tệp này cho phép Unicom nhận dạng thiết bị, ghi
              nhận thông tin về thời điểm và cách thức sản phẩm hoặc website được sử dụng, số lượng người
              truy cập, cũng như theo dõi các hoạt động của Khách hàng trên nền tảng của Unicom.</p>
            </SubSection>
            <SubSection number="12.2">
              <p>Unicom có thể liên kết thông tin thu thập từ cookie với dữ liệu cá nhân của Chủ thể dữ
              liệu/Khách hàng. Cookies cũng được dùng để liên kết với thông tin về các sản phẩm, dịch vụ
              mà Khách hàng đã chọn hoặc quan tâm. Việc này nhằm phục vụ các mục đích như duy trì giỏ
              hàng, cung cấp nội dung được cá nhân hóa theo sở thích của Khách hàng và giám sát việc sử dụng sản phẩm.</p>
            </SubSection>
            <SubSection number="12.3">
              <p>Khách hàng có quyền từ chối hoặc vô hiệu hóa việc sử dụng cookie bằng cách điều chỉnh các
              thiết lập phù hợp trên trình duyệt của mình. Tuy nhiên, Unicom lưu ý rằng hành động này có thể
              khiến Khách hàng không tận dụng được đầy đủ các chức năng trên website hoặc sản phẩm của chúng tôi.</p>
            </SubSection>
          </Section>

          {/* Section 13 */}
          <Section title="13. SỬA ĐỔI, BỔ SUNG, THAY THẾ CHÍNH SÁCH BẢO VỆ DLCN">
            <SubSection number="13.1">
              <p>Unicom được phép sửa đổi, bổ sung nội dung hoặc thay thế Chính sách bảo vệ DLCN này vào bất cứ thời điểm nào Unicom cho là phù hợp.</p>
            </SubSection>
            <SubSection number="13.2">
              <p>Unicom sẽ thực hiện thông báo các nội dung sửa đổi, bổ sung, thay thế cho Chủ thể dữ
              liệu/Khách hàng bằng một trong các hình thức bao gồm: văn bản, email, thông báo trên
              phương tiện thông tin đại chúng, thông báo trên website chính thức của Unicom, niêm yết tại trụ
              sở các điểm giao dịch của Unicom hoặc các hình thức khác Unicom đánh giá là phù hợp.</p>
            </SubSection>
            <SubSection number="13.3">
              <p>Unicom khuyến nghị Chủ thể dữ liệu thường xuyên theo dõi, cập nhật các nội dung của chính
              sách này để nắm được thông tin đúng nhất về việc thu thập, xử lý dữ liệu, thông tin của Unicom.</p>
            </SubSection>
          </Section>

          {/* Section 14 */}
          <Section title="14. GIẢI QUYẾT TRANH CHẤP">
            <p className="text-foreground leading-relaxed">
              Nếu có bất kỳ tranh chấp nào phát sinh hoặc liên quan đến việc Xử lý Dữ liệu cá nhân thì
              Khách hàng và Unicom trước hết sẽ cùng nhau giải quyết thông qua thương lượng trên tinh thần
              vì quyền lợi của Khách hàng. Trong trường hợp thương lượng không thành, các bên có quyền
              đưa vụ tranh chấp đó ra Tòa án có thẩm quyền ở Việt Nam giải quyết.
            </p>
          </Section>

          {/* Section 15 */}
          <Section title="15. ĐIỀU KHOẢN THI HÀNH">
            <p className="text-foreground leading-relaxed">
              Chính sách về bảo vệ Dữ liệu cá nhân này là một phần đính kèm, không tách rời với các cam
              kết, thỏa thuận của Khách hàng với Unicom và áp dụng đối với mọi Dữ liệu cá nhân, mọi giao
              dịch của Khách hàng với Unicom, thể hiện sự đồng ý toàn bộ của Khách hàng đối với Unicom
              trong việc Xử lý Dữ liệu cá nhân của Chủ thể dữ liệu/Khách hàng.
            </p>
            <p className="text-foreground leading-relaxed mt-2">
              Chính sách bảo vệ Dữ liệu cá nhân này sẽ được ưu tiên áp dụng trong trường hợp có bất kỳ
              mâu thuẫn nào với các thỏa thuận giữa Khách hàng và Unicom. Trường hợp có bất kỳ sự phản
              đối, yêu cầu nào liên quan tới việc Xử lý Dữ liệu cá nhân của Khách hàng bởi Unicom, Khách
              hàng sẽ chủ động liên hệ Unicom tại các đầu mối phụ trách hoặc email trực tiếp đến địa chỉ
              <span className="text-primary font-medium"> dpo@unicom.com.vn</span> để được hỗ trợ.
            </p>
          </Section>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground italic">Phiên bản cập nhật ngày 01/11/2025</p>
            <p className="text-sm text-muted-foreground mt-1">© Công ty Cổ phần Unicom. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-8">
    <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const SubSection = ({ number, title, children }: { number: string; title?: string; children: React.ReactNode }) => (
  <div className="ml-2">
    <div className="text-foreground leading-relaxed">
      <span className="font-semibold">{number}. {title && <span>{title}: </span>}</span>
      <div className="mt-1 space-y-2">{children}</div>
    </div>
  </div>
);

export default PrivacyPolicy;
