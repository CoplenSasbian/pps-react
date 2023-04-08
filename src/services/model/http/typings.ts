// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
declare namespace API {
  type DataBaseData<T> = {
    pk: number;
    model: string;
    fields: T;
  };

  type Model = {
    name: string;
    user: number;
    id: number;
    descriptor: any;
    ylable: string;
    woe_iv_table: any;
    data_type: any;
    missing_info: any;
    base_score: number;
    pdo_score: number;
    odds:number;
    create_date: Date;
    lable_use: any;
    rocData: string;
  };
}
