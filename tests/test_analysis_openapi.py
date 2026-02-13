import json
from pathlib import Path
import unittest


SPEC_PATH = Path("docs/analysis/openapi-analysis.json")


class AnalysisOpenApiSpecTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))

    def test_required_paths_exist(self):
        paths = self.spec["paths"]
        self.assertIn("/analysis/filters", paths)
        self.assertIn("/analysis/run", paths)
        self.assertIn("/analysis/service-level/apply", paths)
        self.assertIn("/analysis/save", paths)

    def test_run_request_contains_required_business_fields(self):
        request_schema = self.spec["components"]["schemas"]["AnalysisRunRequest"]
        properties = request_schema["properties"]

        for field in ["period", "dataMode", "viewType", "scope", "axes", "thresholds", "flags"]:
            self.assertIn(field, properties)

        self.assertEqual(
            properties["scope"]["$ref"],
            "#/components/schemas/Scope",
        )
        self.assertEqual(
            properties["axes"]["$ref"],
            "#/components/schemas/AxisConfig",
        )
        self.assertEqual(
            properties["thresholds"]["$ref"],
            "#/components/schemas/Thresholds",
        )
        self.assertEqual(
            properties["flags"]["$ref"],
            "#/components/schemas/RunFlags",
        )

    def test_errors_and_versioning_are_defined(self):
        components = self.spec["components"]
        self.assertIn("ValidationErrorResponse", components["schemas"])
        self.assertIn("BusinessErrorResponse", components["schemas"])
        self.assertIn("XApiVersion", components["parameters"])


if __name__ == "__main__":
    unittest.main()
