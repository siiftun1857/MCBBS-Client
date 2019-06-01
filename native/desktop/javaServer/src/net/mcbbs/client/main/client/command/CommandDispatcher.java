/*
  Copyright 2019 langyo<langyo.china@gmail.com> and contributors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

package net.mcbbs.client.main.client.command;

import net.mcbbs.client.main.client.command.task.CommandTask;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class CommandDispatcher {
    public static ExecutorService service = Executors.newFixedThreadPool(16);
    public static final CommandDispatcher DISPATCHER = new CommandDispatcher();

    private CommandDispatcher() {
    }

    public final void dispatchAsync(Command command) {
        switch (command.getType()) {
            case EXECUTE:
                service.submit(new CommandTask(command));
            case DATA:

                break;
            default:
                break;
        }
    }
}
