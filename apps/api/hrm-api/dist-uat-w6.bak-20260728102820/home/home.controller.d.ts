import { GetHomeSummaryQueryDto } from './dto/get-home-summary.query.dto';
import { HomeService } from './home.service';
export declare class HomeController {
    private readonly homeService;
    constructor(homeService: HomeService);
    private assertAccess;
    getSummary(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetHomeSummaryQueryDto): Promise<import("../common/api-response").ApiSuccess<import("./home-summary.types").HomeSummaryData>>;
}
