import luigi

class SimpleTask(luigi.Task):
    """
    SimpleTask prints Hello World!.
    """

    def output(self):
        return MockFile("SimpleTask")

    def run(self):
        1+1
        _out = self.output().open('w')
        _out.close()

class DecoratedTask(luigi.Task):
    """
    DecoratedTask depends on the SimpleTask
    """


    def requires(self):
        return SimpleTask()

    def run(self):
        a = 1+1
        print(a)

if __name__ == '__main__':
    from luigi.mock import MockFile # import this here for compatibility with Windows
    # if you are running windows, you would need --lock-pid-dir argument;
    # Modified run would look like
    # luigi.run(["--lock-pid-dir", "D:\\temp\\", "--local-scheduler"], main_task_cls=DecoratedTask)
    luigi.run(["--local-scheduler"], main_task_cls=DecoratedTask)
