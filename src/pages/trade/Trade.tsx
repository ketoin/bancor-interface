import { Page } from 'components/Page';
import { TradeWidget } from 'elements/trade/TradeWidget';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from 'store/index';
import { getV3Tokens } from 'store/bancor/token';
import { ethToken } from 'services/web3/config';

export const Trade = () => {
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') ?? ethToken;
  const to = searchParams.get('to') ?? undefined;

  const tokens = useAppSelector(getV3Tokens);

  return (
    <Page>
      <div className="flex justify-center">
        <div className="content-block p-10 rounded-40">
          <h2 className="text-[22px] ml-20 mt-20">Trade</h2>
          <hr className="border-1 border-fog my-20 -mx-10" />
          <TradeWidget from={from} to={to} tokens={tokens} />
        </div>
      </div>
    </Page>
  );
};
