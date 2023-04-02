import * as React from 'react';
import {initializeIcons} from '@fluentui/react';

initializeIcons();

export class Header extends React.Component {

   render() {
       return (
          <div>
              Datadog Demo: APM, Logs, Profiler, NPM, RUM
          </div>
       );
   }
}
