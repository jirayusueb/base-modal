import { render } from "@testing-library/react";
import { create, ModalDef, Provider, register, useModal } from "../index";
import { TestModal, testUseModal } from "../tests";

const HocTestModal = create(({ name = "nate" }: { name?: string }) => {
  const modal = useModal();
  const remove = () => modal.remove();

  return (
    <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
      <span>{name}</span>
      <div>HocTestModal</div>
    </TestModal>
  );
});

describe("useModal", () => {
  it("useModal by id of registered modal", async () => {
    const hocTestModalId = "hoc-test-modal";
    register(hocTestModalId, HocTestModal, { name: "bood" });
    let modal: any;
    const App = () => {
      modal = useModal(hocTestModalId);
      return <Provider />;
    };
    render(<App />);
    await testUseModal(modal);
  });

  it("useModal by id of declared modal via JSX", async () => {
    let modal: any;
    const App = () => {
      modal = useModal("mytestmodal");
      return (
        <Provider>
          <HocTestModal id="mytestmodal" name="bood" />
        </Provider>
      );
    };
    render(<App />);
    await testUseModal(modal);
  });

  it("useModal by id of declared modal via ModalDef", async () => {
    let modal: any;
    const App = () => {
      modal = useModal("mytestmodal2");
      return (
        <Provider>
          <ModalDef id="mytestmodal2" component={HocTestModal} />
        </Provider>
      );
    };
    render(<App />);
    await testUseModal(modal, { name: "bood" });
  });

  it("useModal by component directly", async () => {
    let modal: any;
    const App = () => {
      modal = useModal(HocTestModal, { name: "bood" });
      return <Provider />;
    };
    render(<App />);
    await testUseModal(modal);
  });
});
